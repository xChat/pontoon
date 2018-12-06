import graphene
from graphene_django import DjangoObjectType
from graphene_django.debug import DjangoDebug

from django.contrib.auth import get_user_model

from pontoon.api.util import get_fields
from pontoon.base.models import (
    Comment as CommentModel,
    Entity as EntityModel,
    Locale as LocaleModel,
    Project as ProjectModel,
    ProjectLocale as ProjectLocaleModel,
    Translation as TranslationModel,
)


class Stats(object):
    missing_strings = graphene.Int()
    complete = graphene.Boolean()


class ProjectLocale(DjangoObjectType, Stats):
    class Meta:
        model = ProjectLocaleModel
        only_fields = (
            'project',
            'locale',
            'total_strings',
            'approved_strings',
            'fuzzy_strings',
            'strings_with_errors',
            'strings_with_warnings',
            'unreviewed_strings',
        )


class Project(DjangoObjectType, Stats):
    class Meta:
        model = ProjectModel
        only_fields = (
            'name',
            'slug',
            'disabled',
            'sync_disabled',
            'info',
            'deadline',
            'priority',
            'contact',
            'total_strings',
            'approved_strings',
            'fuzzy_strings',
            'strings_with_errors',
            'strings_with_warnings',
            'unreviewed_strings',
        )

    localizations = graphene.List(ProjectLocale)

    def resolve_localizations(obj, _info):
        return obj.project_locale.all()


class Locale(DjangoObjectType, Stats):
    class Meta:
        model = LocaleModel
        only_fields = (
            'name',
            'code',
            'direction',
            'cldr_plurals',
            'plural_rule',
            'script',
            'population',
            'total_strings',
            'approved_strings',
            'fuzzy_strings',
            'strings_with_errors',
            'strings_with_warnings',
            'unreviewed_strings',
        )

    localizations = graphene.List(
        ProjectLocale,
        include_disabled=graphene.Boolean(False),
    )

    def resolve_localizations(obj, _info, include_disabled):
        qs = obj.project_locale

        if include_disabled:
            return qs.all()

        return qs.filter(project__disabled=False)


class User(DjangoObjectType):
    class Meta:
        model = get_user_model()
        only_fields = (
            'username',
            'first_name',
        )


class Entity(DjangoObjectType):
    class Meta:
        model = EntityModel
        only_fields = (
            'id',
            'string',
            'string_plural',
            'key',
            'comment',
            'order',
        )


class Comment(DjangoObjectType):
    class Meta:
        model = CommentModel
        only_fields = (
            'comment',
            'date',
        )

    user = graphene.Field(User)

    def resolve_user(obj, _info):
        return obj.user


class Translation(DjangoObjectType):
    class Meta:
        model = TranslationModel
        only_fields = (
            'id',
            'string',
            'plural_form',
            'date',
            'active',
            'approved',
            'rejected',
            'fuzzy',
        )

    entity = graphene.Field(Entity)
    user = graphene.Field(User)
    comments = graphene.List(Comment)

    def resolve_entity(obj, _info):
        return obj.entity

    def resolve_user(obj, _info):
        return obj.user

    def resolve_comments(obj, _info):
        return obj.comments.all()


class Query(graphene.ObjectType):
    debug = graphene.Field(DjangoDebug, name='__debug')

    # include_disabled=True will return both active and disabled projects.
    projects = graphene.List(Project, include_disabled=graphene.Boolean(False))
    project = graphene.Field(Project, slug=graphene.String())

    locales = graphene.List(Locale)
    locale = graphene.Field(Locale, code=graphene.String())

    unreviewed_translations = graphene.List(
        Translation,
        locale=graphene.String(),
        project=graphene.String(),
    )
    translation = graphene.Field(Translation, id=graphene.String())

    def resolve_projects(obj, info, include_disabled):
        qs = ProjectModel.objects
        fields = get_fields(info)

        if 'projects.localizations' in fields:
            qs = qs.prefetch_related('project_locale__locale')

        if 'projects.localizations.locale.localizations' in fields:
            raise Exception('Cyclic queries are forbidden')

        if include_disabled:
            return qs.all()

        return qs.filter(disabled=False)

    def resolve_project(obj, info, slug):
        qs = ProjectModel.objects
        fields = get_fields(info)

        if 'project.localizations' in fields:
            qs = qs.prefetch_related('project_locale__locale')

        if 'project.localizations.locale.localizations' in fields:
            raise Exception('Cyclic queries are forbidden')

        return qs.get(slug=slug)

    def resolve_locales(obj, info):
        qs = LocaleModel.objects
        fields = get_fields(info)

        if 'locales.localizations' in fields:
            qs = qs.prefetch_related('project_locale__project')

        if 'locales.localizations.project.localizations' in fields:
            raise Exception('Cyclic queries are forbidden')

        return qs.all()

    def resolve_locale(obj, info, code):
        qs = LocaleModel.objects
        fields = get_fields(info)

        if 'locale.localizations' in fields:
            qs = qs.prefetch_related('project_locale__project')

        if 'locale.localizations.project.localizations' in fields:
            raise Exception('Cyclic queries are forbidden')

        return qs.get(code=code)

    def resolve_unreviewed_translations(obj, info, locale, project):
        qs = TranslationModel.objects.filter(
            entity__obsolete=False,
            approved=False,
            rejected=False,
        )

        fields = get_fields(info)

        if 'unreviewed_translations.user' in fields:
            qs = qs.prefetch_related('user')

        if 'unreviewed_translations.entity' in fields:
            qs = qs.prefetch_related('entity')

        if 'unreviewed_translations.comments' in fields:
            qs = qs.prefetch_related('comments')

        if locale:
            qs = qs.filter(locale__code=locale)

        if project:
            qs = qs.filter(entity__resource__project__slug=project)

        return qs.all()

    def resolve_translation(obj, info, id):
        qs = TranslationModel.objects
        fields = get_fields(info)

        if 'translation.user' in fields:
            qs = qs.prefetch_related('user')

        if 'translation.entity' in fields:
            qs = qs.prefetch_related('entity')

        if 'translation.comments' in fields:
            qs = qs.prefetch_related('comments')

        return qs.get(pk=id)


schema = graphene.Schema(query=Query)
