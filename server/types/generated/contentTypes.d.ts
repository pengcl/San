import type { Schema, Struct } from '@strapi/strapi';

export interface AdminApiToken extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_api_tokens';
  info: {
    description: '';
    displayName: 'Api Token';
    name: 'Api Token';
    pluralName: 'api-tokens';
    singularName: 'api-token';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Schema.Attribute.DefaultTo<''>;
    encryptedKey: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    expiresAt: Schema.Attribute.DateTime;
    lastUsedAt: Schema.Attribute.DateTime;
    lifespan: Schema.Attribute.BigInteger;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::api-token'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'admin::api-token-permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    type: Schema.Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'read-only'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminApiTokenPermission extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_api_token_permissions';
  info: {
    description: '';
    displayName: 'API Token Permission';
    name: 'API Token Permission';
    pluralName: 'api-token-permissions';
    singularName: 'api-token-permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::api-token-permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    token: Schema.Attribute.Relation<'manyToOne', 'admin::api-token'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminPermission extends Struct.CollectionTypeSchema {
  collectionName: 'admin_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'Permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    actionParameters: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>;
    conditions: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<[]>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::permission'> &
      Schema.Attribute.Private;
    properties: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>;
    publishedAt: Schema.Attribute.DateTime;
    role: Schema.Attribute.Relation<'manyToOne', 'admin::role'>;
    subject: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminRole extends Struct.CollectionTypeSchema {
  collectionName: 'admin_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'Role';
    pluralName: 'roles';
    singularName: 'role';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::role'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<'oneToMany', 'admin::permission'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    users: Schema.Attribute.Relation<'manyToMany', 'admin::user'>;
  };
}

export interface AdminTransferToken extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_transfer_tokens';
  info: {
    description: '';
    displayName: 'Transfer Token';
    name: 'Transfer Token';
    pluralName: 'transfer-tokens';
    singularName: 'transfer-token';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Schema.Attribute.DefaultTo<''>;
    expiresAt: Schema.Attribute.DateTime;
    lastUsedAt: Schema.Attribute.DateTime;
    lifespan: Schema.Attribute.BigInteger;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token-permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminTransferTokenPermission
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_transfer_token_permissions';
  info: {
    description: '';
    displayName: 'Transfer Token Permission';
    name: 'Transfer Token Permission';
    pluralName: 'transfer-token-permissions';
    singularName: 'transfer-token-permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token-permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    token: Schema.Attribute.Relation<'manyToOne', 'admin::transfer-token'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminUser extends Struct.CollectionTypeSchema {
  collectionName: 'admin_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'User';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    blocked: Schema.Attribute.Boolean &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<false>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    firstname: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    isActive: Schema.Attribute.Boolean &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<false>;
    lastname: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::user'> &
      Schema.Attribute.Private;
    password: Schema.Attribute.Password &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    preferedLanguage: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    registrationToken: Schema.Attribute.String & Schema.Attribute.Private;
    resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private;
    roles: Schema.Attribute.Relation<'manyToMany', 'admin::role'> &
      Schema.Attribute.Private;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    username: Schema.Attribute.String;
  };
}

export interface ApiArenaRecordArenaRecord extends Struct.CollectionTypeSchema {
  collectionName: 'arena_records';
  info: {
    description: '\u7ADE\u6280\u573A\u6392\u540D\u548C\u6218\u7EE9\u8BB0\u5F55';
    displayName: '\u7ADE\u6280\u573A\u8BB0\u5F55';
    pluralName: 'arena-records';
    singularName: 'arena-record';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    best_rank: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<999999>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    current_rank: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<999999>;
    defeats: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<0>;
    last_battle_at: Schema.Attribute.DateTime;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::arena-record.arena-record'
    > &
      Schema.Attribute.Private;
    points: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<1000>;
    publishedAt: Schema.Attribute.DateTime;
    season_id: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<1>;
    total_battles: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<0>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    victories: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<0>;
    win_streak: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<0>;
  };
}

export interface ApiBattleBattle extends Struct.CollectionTypeSchema {
  collectionName: 'battles';
  info: {
    description: '\u6218\u6597\u7CFB\u7EDF\u6570\u636E\u6A21\u578B';
    displayName: '\u6218\u6597\u8BB0\u5F55';
    pluralName: 'battles';
    singularName: 'battle';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    battle_id: Schema.Attribute.UID & Schema.Attribute.Required;
    battle_log: Schema.Attribute.JSON;
    battle_type: Schema.Attribute.Enumeration<
      ['pve_normal', 'pve_elite', 'pvp_arena', 'guild_war', 'world_boss']
    > &
      Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    duration: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    ended_at: Schema.Attribute.DateTime;
    enemy_formation: Schema.Attribute.JSON;
    experience_gained: Schema.Attribute.JSON;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::battle.battle'
    > &
      Schema.Attribute.Private;
    opponent: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    player: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    player_formation: Schema.Attribute.JSON;
    publishedAt: Schema.Attribute.DateTime;
    result: Schema.Attribute.Enumeration<
      ['ongoing', 'victory', 'defeat', 'draw', 'timeout']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'ongoing'>;
    rewards: Schema.Attribute.JSON;
    stage_id: Schema.Attribute.String;
    star_rating: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 3;
          min: 0;
        },
        number
      >;
    statistics: Schema.Attribute.JSON;
    turns: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiChapterChapter extends Struct.CollectionTypeSchema {
  collectionName: 'chapters';
  info: {
    description: '\u6E38\u620F\u5267\u60C5\u7AE0\u8282\u6570\u636E';
    displayName: '\u6E38\u620F\u7AE0\u8282';
    pluralName: 'chapters';
    singularName: 'chapter';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    background_image: Schema.Attribute.String;
    chapter_id: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    difficulty: Schema.Attribute.Enumeration<
      ['tutorial', 'easy', 'normal', 'hard', 'nightmare', 'hell']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'normal'>;
    first_clear_rewards: Schema.Attribute.JSON;
    is_active: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::chapter.chapter'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    prev_chapter_id: Schema.Attribute.Integer;
    publishedAt: Schema.Attribute.DateTime;
    required_stars: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    sort_order: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<0>;
    special_rules: Schema.Attribute.JSON;
    story_intro: Schema.Attribute.Text;
    three_star_rewards: Schema.Attribute.JSON;
    total_stages: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 30;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<10>;
    unlock_level: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 120;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiCityDevelopmentPathCityDevelopmentPath
  extends Struct.CollectionTypeSchema {
  collectionName: 'city_development_paths';
  info: {
    description: '\u57CE\u6C60\u53D1\u5C55\u8DEF\u7EBF\u914D\u7F6E\u6570\u636E';
    displayName: '\u57CE\u6C60\u53D1\u5C55\u8DEF\u7EBF';
    pluralName: 'city-development-paths';
    singularName: 'city-development-path';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Text;
    development_risks: Schema.Attribute.JSON;
    development_stages: Schema.Attribute.JSON;
    development_type: Schema.Attribute.Enumeration<
      [
        'military_fortress',
        'trade_hub',
        'cultural_center',
        'resource_base',
        'defensive_stronghold',
      ]
    > &
      Schema.Attribute.Required;
    difficulty_rating: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 10;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<5>;
    display_order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    early_priorities: Schema.Attribute.JSON;
    famous_implementations: Schema.Attribute.JSON;
    historical_examples: Schema.Attribute.JSON;
    is_active: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    late_game_bonuses: Schema.Attribute.JSON;
    late_game_objectives: Schema.Attribute.JSON;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::city-development-path.city-development-path'
    > &
      Schema.Attribute.Private;
    maintenance_challenges: Schema.Attribute.JSON;
    mid_game_focus: Schema.Attribute.JSON;
    milestone_buildings: Schema.Attribute.JSON;
    name_en: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 30;
      }>;
    name_zh: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 30;
      }>;
    optimal_city_types: Schema.Attribute.JSON;
    path_id: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 30;
      }>;
    popularity_score: Schema.Attribute.Float &
      Schema.Attribute.SetMinMax<
        {
          max: 1;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0.5>;
    primary_benefits: Schema.Attribute.JSON;
    publishedAt: Schema.Attribute.DateTime;
    recommended_for: Schema.Attribute.JSON;
    resource_requirements: Schema.Attribute.JSON;
    secondary_benefits: Schema.Attribute.JSON;
    specialization_focus: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 30;
      }>;
    stage_requirements: Schema.Attribute.JSON;
    strategy_guide: Schema.Attribute.Text;
    success_rate: Schema.Attribute.Float &
      Schema.Attribute.SetMinMax<
        {
          max: 1;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0.7>;
    synergy_cities: Schema.Attribute.JSON;
    time_investment_estimate: Schema.Attribute.Integer;
    total_investment_estimate: Schema.Attribute.BigInteger;
    unique_abilities: Schema.Attribute.JSON;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    vulnerability_factors: Schema.Attribute.JSON;
  };
}

export interface ApiCityPolicyCityPolicy extends Struct.CollectionTypeSchema {
  collectionName: 'city_policies';
  info: {
    description: '\u57CE\u6C60\u653F\u7B56\u914D\u7F6E\u6570\u636E';
    displayName: '\u57CE\u6C60\u653F\u7B56';
    pluralName: 'city-policies';
    singularName: 'city-policy';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    applicable_city_types: Schema.Attribute.JSON;
    category: Schema.Attribute.Enumeration<
      ['taxation', 'military', 'trade', 'culture', 'development', 'diplomacy']
    > &
      Schema.Attribute.Required;
    conflicting_policies: Schema.Attribute.JSON;
    cost_modifiers: Schema.Attribute.JSON;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    daily_maintenance: Schema.Attribute.JSON;
    description: Schema.Attribute.Text;
    difficulty_level: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 10;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<3>;
    duration_days: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    dynasty_origin: Schema.Attribute.Enumeration<
      ['han', 'wei', 'shu', 'wu', 'general']
    > &
      Schema.Attribute.DefaultTo<'general'>;
    effectiveness_rating: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 10;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<5>;
    historical_context: Schema.Attribute.Text;
    implementation_cost: Schema.Attribute.JSON;
    is_active: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::city-policy.city-policy'
    > &
      Schema.Attribute.Private;
    loyalty_effects: Schema.Attribute.JSON;
    min_city_level: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1>;
    min_governance_level: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    min_population: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1000>;
    name_en: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 30;
      }>;
    name_zh: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 30;
      }>;
    policy_effects: Schema.Attribute.JSON;
    policy_id: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 30;
      }>;
    policy_type: Schema.Attribute.Enumeration<
      ['economic', 'social', 'military', 'diplomatic', 'administrative']
    > &
      Schema.Attribute.Required;
    population_effects: Schema.Attribute.JSON;
    prerequisite_policies: Schema.Attribute.JSON;
    publishedAt: Schema.Attribute.DateTime;
    required_buildings: Schema.Attribute.JSON;
    required_technologies: Schema.Attribute.JSON;
    sub_type: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 20;
      }>;
    unlock_conditions: Schema.Attribute.JSON;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiCityTypeCityType extends Struct.CollectionTypeSchema {
  collectionName: 'city_types';
  info: {
    description: '\u57CE\u6C60\u7C7B\u578B\u5B9A\u4E49\u6570\u636E';
    displayName: '\u57CE\u6C60\u7C7B\u578B';
    pluralName: 'city-types';
    singularName: 'city-type';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    color_hex: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 7;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    defensive_bonus: Schema.Attribute.Float &
      Schema.Attribute.SetMinMax<
        {
          max: 2;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    description: Schema.Attribute.Text;
    development_focus: Schema.Attribute.Enumeration<
      ['military', 'economic', 'cultural', 'defensive']
    > &
      Schema.Attribute.Required;
    display_order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    economic_bonus: Schema.Attribute.Float &
      Schema.Attribute.SetMinMax<
        {
          max: 2;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    icon_url: Schema.Attribute.String;
    is_active: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::city-type.city-type'
    > &
      Schema.Attribute.Private;
    max_buildings: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 5;
        },
        number
      > &
      Schema.Attribute.DefaultTo<20>;
    name_en: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 30;
      }>;
    name_zh: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 30;
      }>;
    population_capacity: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 1000;
        },
        number
      > &
      Schema.Attribute.DefaultTo<10000>;
    publishedAt: Schema.Attribute.DateTime;
    special_features: Schema.Attribute.JSON;
    terrain_requirements: Schema.Attribute.JSON;
    type_id: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 20;
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiCityCity extends Struct.CollectionTypeSchema {
  collectionName: 'cities';
  info: {
    description: '\u6E38\u620F\u57CE\u6C60\u914D\u7F6E\u6570\u636E';
    displayName: '\u57CE\u6C60\u4FE1\u606F';
    pluralName: 'cities';
    singularName: 'city';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    base_defense: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<50>;
    base_loyalty: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<80>;
    base_population: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1000>;
    base_prosperity: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<100>;
    capture_difficulty: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 10;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<5>;
    city_id: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    city_type: Schema.Attribute.Relation<
      'manyToOne',
      'api::city-type.city-type'
    >;
    coordinates: Schema.Attribute.JSON;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    cultural_traits: Schema.Attribute.JSON;
    dynasty_control: Schema.Attribute.Enumeration<
      ['han', 'wei', 'shu', 'wu', 'neutral']
    > &
      Schema.Attribute.DefaultTo<'neutral'>;
    famous_residents: Schema.Attribute.JSON;
    garrison_capacity: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1000>;
    historical_events: Schema.Attribute.JSON;
    historical_importance: Schema.Attribute.Enumeration<
      ['capital', 'major', 'important', 'minor']
    > &
      Schema.Attribute.DefaultTo<'minor'>;
    is_active: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    is_capturable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    local_specialties: Schema.Attribute.JSON;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::city.city'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    natural_defenses: Schema.Attribute.JSON;
    publishedAt: Schema.Attribute.DateTime;
    region: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 30;
      }>;
    resource_production: Schema.Attribute.JSON;
    resource_richness: Schema.Attribute.Enumeration<
      ['poor', 'average', 'rich', 'very_rich']
    > &
      Schema.Attribute.DefaultTo<'average'>;
    siege_difficulty: Schema.Attribute.Enumeration<
      ['very_easy', 'easy', 'medium', 'hard', 'very_hard']
    > &
      Schema.Attribute.DefaultTo<'medium'>;
    strategic_value: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 10;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1>;
    sub_region: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 30;
      }>;
    tax_efficiency: Schema.Attribute.Float &
      Schema.Attribute.SetMinMax<
        {
          max: 2;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1>;
    terrain_type: Schema.Attribute.Enumeration<
      ['plains', 'hills', 'mountain', 'river', 'coastal', 'desert']
    > &
      Schema.Attribute.Required;
    trade_routes: Schema.Attribute.JSON;
    trade_specialties: Schema.Attribute.JSON;
    unlock_conditions: Schema.Attribute.JSON;
    unlock_level: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 120;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiFactionFaction extends Struct.CollectionTypeSchema {
  collectionName: 'factions';
  info: {
    description: 'Three Kingdoms faction configuration';
    displayName: '\u9635\u8425';
    pluralName: 'factions';
    singularName: 'faction';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    banner_color: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 7;
      }>;
    capital_city: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    color_hex: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 7;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Text;
    display_order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    emblem_url: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    faction_bonus: Schema.Attribute.JSON;
    faction_id: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 10;
      }>;
    founding_emperor: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    heroes: Schema.Attribute.Relation<'oneToMany', 'api::hero.hero'>;
    historical_period: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    is_active: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::faction.faction'
    > &
      Schema.Attribute.Private;
    name_en: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 20;
      }>;
    name_zh: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 20;
      }>;
    publishedAt: Schema.Attribute.DateTime;
    territory_bonus: Schema.Attribute.JSON;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiFriendRequestFriendRequest
  extends Struct.CollectionTypeSchema {
  collectionName: 'friend_requests';
  info: {
    description: '\u597D\u53CB\u7533\u8BF7\u6570\u636E';
    displayName: '\u597D\u53CB\u7533\u8BF7';
    pluralName: 'friend-requests';
    singularName: 'friend-request';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    expires_at: Schema.Attribute.DateTime;
    from_user: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::friend-request.friend-request'
    > &
      Schema.Attribute.Private;
    message: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    publishedAt: Schema.Attribute.DateTime;
    responded_at: Schema.Attribute.DateTime;
    status: Schema.Attribute.Enumeration<
      ['pending', 'accepted', 'rejected', 'expired']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'pending'>;
    to_user: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiFriendshipFriendship extends Struct.CollectionTypeSchema {
  collectionName: 'friendships';
  info: {
    description: '\u7528\u6237\u597D\u53CB\u5173\u7CFB\u6570\u636E';
    displayName: '\u597D\u53CB\u5173\u7CFB';
    pluralName: 'friendships';
    singularName: 'friendship';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    daily_interacted: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    friend: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    friendship_level: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 10;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1>;
    friendship_points: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    last_interaction: Schema.Attribute.DateTime;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::friendship.friendship'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    total_interactions: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiGuildMemberGuildMember extends Struct.CollectionTypeSchema {
  collectionName: 'guild_members';
  info: {
    description: '\u516C\u4F1A\u6210\u5458\u5173\u7CFB\u6570\u636E';
    displayName: '\u516C\u4F1A\u6210\u5458';
    pluralName: 'guild-members';
    singularName: 'guild-member';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    contribution_points: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    guild: Schema.Attribute.Relation<'manyToOne', 'api::guild.guild'>;
    joined_at: Schema.Attribute.DateTime & Schema.Attribute.Required;
    last_donation_at: Schema.Attribute.DateTime;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::guild-member.guild-member'
    > &
      Schema.Attribute.Private;
    notes: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
    permissions: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<[]>;
    publishedAt: Schema.Attribute.DateTime;
    role: Schema.Attribute.Enumeration<
      ['leader', 'officer', 'elite', 'member']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'member'>;
    total_contribution: Schema.Attribute.BigInteger &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    weekly_contribution: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
  };
}

export interface ApiGuildGuild extends Struct.CollectionTypeSchema {
  collectionName: 'guilds';
  info: {
    description: '\u516C\u4F1A\u7EC4\u7EC7\u6570\u636E';
    displayName: '\u516C\u4F1A';
    pluralName: 'guilds';
    singularName: 'guild';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    announcement: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 1000;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
    experience: Schema.Attribute.BigInteger &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    is_recruiting: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    language: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 10;
      }> &
      Schema.Attribute.DefaultTo<'zh'>;
    leader: Schema.Attribute.Relation<
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    level: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::guild.guild'> &
      Schema.Attribute.Private;
    logo: Schema.Attribute.String;
    max_members: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 10;
        },
        number
      > &
      Schema.Attribute.DefaultTo<30>;
    member_count: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 20;
        minLength: 2;
      }>;
    publishedAt: Schema.Attribute.DateTime;
    requirements: Schema.Attribute.JSON;
    settings: Schema.Attribute.JSON;
    tag: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 6;
        minLength: 2;
      }>;
    total_power: Schema.Attribute.BigInteger & Schema.Attribute.DefaultTo<0>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    weekly_activity: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
  };
}

export interface ApiHeroHero extends Struct.CollectionTypeSchema {
  collectionName: 'heroes';
  info: {
    description: '\u6B66\u5C06\u6A21\u677F\u6570\u636E';
    displayName: '\u6B66\u5C06';
    pluralName: 'heroes';
    singularName: 'hero';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    avatar_url: Schema.Attribute.String;
    base_attack: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<20>;
    base_defense: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<15>;
    base_hp: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<100>;
    base_speed: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<10>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Text;
    faction: Schema.Attribute.Relation<'manyToOne', 'api::faction.faction'>;
    hero_id: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::hero.hero'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    quality: Schema.Attribute.Relation<'manyToOne', 'api::quality.quality'>;
    skills: Schema.Attribute.Relation<'manyToMany', 'api::skill.skill'>;
    unit_type: Schema.Attribute.Relation<
      'manyToOne',
      'api::unit-type.unit-type'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiItemTemplateItemTemplate
  extends Struct.CollectionTypeSchema {
  collectionName: 'items';
  info: {
    description: '\u6E38\u620F\u7269\u54C1\u6A21\u677F\u914D\u7F6E';
    displayName: '\u7269\u54C1\u6A21\u677F';
    pluralName: 'item-templates';
    singularName: 'item-template';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    category: Schema.Attribute.Enumeration<
      [
        'materials',
        'consumables',
        'equipment',
        'fragments',
        'currency',
        'special',
      ]
    > &
      Schema.Attribute.Required;
    cooldown: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Text;
    effects: Schema.Attribute.JSON;
    icon: Schema.Attribute.String;
    is_active: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    is_usable: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    item_id: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::item-template.item-template'
    > &
      Schema.Attribute.Private;
    max_stack: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<99>;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    publishedAt: Schema.Attribute.DateTime;
    quality: Schema.Attribute.Relation<'manyToOne', 'api::quality.quality'>;
    rarity: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 6;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1>;
    sell_price: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    use_conditions: Schema.Attribute.JSON;
  };
}

export interface ApiQualityQuality extends Struct.CollectionTypeSchema {
  collectionName: 'qualities';
  info: {
    description: '\u6B66\u5C06\u54C1\u8D28\u7CFB\u7EDF';
    displayName: '\u54C1\u8D28';
    pluralName: 'qualities';
    singularName: 'quality';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    color_hex: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 7;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Text;
    effects: Schema.Attribute.JSON;
    heroes: Schema.Attribute.Relation<'oneToMany', 'api::hero.hero'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::quality.quality'
    > &
      Schema.Attribute.Private;
    name_en: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 20;
      }>;
    name_zh: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 20;
      }>;
    publishedAt: Schema.Attribute.DateTime;
    quality_id: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMax<
        {
          max: 10;
          min: 1;
        },
        number
      >;
    rarity_weight: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 1;
          min: 0.01;
        },
        number
      >;
    star_count: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 10;
          min: 1;
        },
        number
      >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiResourceTransactionResourceTransaction
  extends Struct.CollectionTypeSchema {
  collectionName: 'resource_transactions';
  info: {
    description: '\u8D44\u6E90\u53D8\u52A8\u4EA4\u6613\u8BB0\u5F55\u6570\u636E';
    displayName: '\u8D44\u6E90\u4EA4\u6613\u8BB0\u5F55';
    pluralName: 'resource-transactions';
    singularName: 'resource-transaction';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    after_amount: Schema.Attribute.BigInteger &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<0>;
    amount: Schema.Attribute.BigInteger & Schema.Attribute.Required;
    before_amount: Schema.Attribute.BigInteger &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<0>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::resource-transaction.resource-transaction'
    > &
      Schema.Attribute.Private;
    metadata: Schema.Attribute.JSON;
    publishedAt: Schema.Attribute.DateTime;
    resource_type: Schema.Attribute.Enumeration<
      [
        'gold',
        'gems',
        'energy',
        'honor',
        'guild_coins',
        'arena_tokens',
        'event_tokens',
        'enhancement_stones',
        'skill_books',
        'awakening_crystals',
        'hero_fragments',
        'equipment_materials',
      ]
    > &
      Schema.Attribute.Required;
    source: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    source_id: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    transaction_type: Schema.Attribute.Enumeration<
      [
        'income',
        'expense',
        'purchase',
        'reward',
        'quest',
        'battle',
        'shop',
        'guild',
        'daily',
        'event',
        'system',
      ]
    > &
      Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiShopItemShopItem extends Struct.CollectionTypeSchema {
  collectionName: 'shop_items';
  info: {
    description: '\u5546\u5E97\u7269\u54C1\u914D\u7F6E';
    displayName: 'Shop Item';
    pluralName: 'shop-items';
    singularName: 'shop-item';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    base_price: Schema.Attribute.Integer & Schema.Attribute.Required;
    category: Schema.Attribute.Enumeration<
      ['material', 'consumable', 'equipment', 'fragment', 'special']
    > &
      Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    currency: Schema.Attribute.Enumeration<
      ['gold', 'gems', 'honor', 'guild_coins', 'arena_tokens']
    > &
      Schema.Attribute.Required;
    description: Schema.Attribute.Text;
    effects: Schema.Attribute.JSON;
    icon: Schema.Attribute.String;
    is_active: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    item_id: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::shop-item.shop-item'
    > &
      Schema.Attribute.Private;
    max_stack: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<999>;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    rarity: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 6;
          min: 1;
        },
        number
      >;
    sell_price: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    sellable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    shop_types: Schema.Attribute.JSON;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiShopShop extends Struct.CollectionTypeSchema {
  collectionName: 'shops';
  info: {
    description: '\u5546\u5E97\u914D\u7F6E';
    displayName: 'Shop';
    pluralName: 'shops';
    singularName: 'shop';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    currency: Schema.Attribute.Enumeration<
      ['gold', 'gems', 'honor', 'guild_coins', 'arena_tokens']
    > &
      Schema.Attribute.Required;
    description: Schema.Attribute.Text;
    free_refreshes_daily: Schema.Attribute.Integer &
      Schema.Attribute.DefaultTo<1>;
    is_active: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    item_slots: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<8>;
    level_requirement: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<1>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::shop.shop'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    refresh_cost: Schema.Attribute.JSON;
    refresh_interval: Schema.Attribute.Integer &
      Schema.Attribute.DefaultTo<86400>;
    shop_type: Schema.Attribute.Enumeration<
      ['general', 'arena', 'guild', 'event', 'vip']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    vip_requirement: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
  };
}

export interface ApiSkillSkill extends Struct.CollectionTypeSchema {
  collectionName: 'skills';
  info: {
    description: 'Hero skills and abilities configuration';
    displayName: '\u6280\u80FD';
    pluralName: 'skills';
    singularName: 'skill';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    animation_url: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    base_damage: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    cooldown: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    cost: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    damage_scaling: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<1>;
    damage_type: Schema.Attribute.Enumeration<
      ['physical', 'magical', 'true', 'healing']
    > &
      Schema.Attribute.Required;
    description: Schema.Attribute.Text;
    effects: Schema.Attribute.JSON;
    heroes: Schema.Attribute.Relation<'manyToMany', 'api::hero.hero'>;
    icon_url: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    is_active: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::skill.skill'> &
      Schema.Attribute.Private;
    max_level: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<10>;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    name_en: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    publishedAt: Schema.Attribute.DateTime;
    skill_id: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    skill_type: Schema.Attribute.Enumeration<
      ['active', 'passive', 'ultimate']
    > &
      Schema.Attribute.Required;
    target_type: Schema.Attribute.Enumeration<
      ['single', 'multiple', 'all_enemies', 'all_allies', 'self']
    > &
      Schema.Attribute.Required;
    unlock_level: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<1>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiStageRewardStageReward extends Struct.CollectionTypeSchema {
  collectionName: 'stage_rewards';
  info: {
    description: '\u5173\u5361\u5956\u52B1\u914D\u7F6E\u6570\u636E';
    displayName: '\u5173\u5361\u5956\u52B1';
    pluralName: 'stage-rewards';
    singularName: 'stage-reward';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    conditions: Schema.Attribute.JSON;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    drop_rate: Schema.Attribute.Float &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<100>;
    is_guaranteed: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::stage-reward.stage-reward'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    quantity: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1>;
    resource_id: Schema.Attribute.String;
    resource_type: Schema.Attribute.Enumeration<
      [
        'gold',
        'gems',
        'energy',
        'hero',
        'hero_fragment',
        'item',
        'equipment',
        'skill_book',
        'enhancement_stone',
        'awakening_crystal',
      ]
    > &
      Schema.Attribute.Required;
    reward_type: Schema.Attribute.Enumeration<
      ['first_clear', 'three_star', 'normal_drop', 'elite_drop', 'daily_bonus']
    > &
      Schema.Attribute.Required;
    stage: Schema.Attribute.Relation<'manyToOne', 'api::stage.stage'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiStageStage extends Struct.CollectionTypeSchema {
  collectionName: 'stages';
  info: {
    description: '\u6E38\u620F\u5173\u5361\u914D\u7F6E\u6570\u636E';
    displayName: '\u6E38\u620F\u5173\u5361';
    pluralName: 'stages';
    singularName: 'stage';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    base_rewards: Schema.Attribute.JSON & Schema.Attribute.Required;
    battle_background: Schema.Attribute.String;
    battle_tips: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    chapter: Schema.Attribute.Relation<'manyToOne', 'api::chapter.chapter'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    daily_attempts: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    drop_items: Schema.Attribute.JSON;
    enemy_formation: Schema.Attribute.JSON & Schema.Attribute.Required;
    energy_cost: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<6>;
    is_active: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    is_boss_stage: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::stage.stage'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    publishedAt: Schema.Attribute.DateTime;
    recommended_power: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<1000>;
    stage_id: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    stage_number: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    stage_type: Schema.Attribute.Enumeration<
      ['normal', 'elite', 'heroic', 'event', 'daily']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'normal'>;
    star_conditions: Schema.Attribute.JSON & Schema.Attribute.Required;
    story_dialogue: Schema.Attribute.JSON;
    unlock_conditions: Schema.Attribute.JSON;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiUnitTypeUnitType extends Struct.CollectionTypeSchema {
  collectionName: 'unit_types';
  info: {
    description: 'Three Kingdoms unit type configuration with combat mechanics';
    displayName: '\u5175\u79CD\u7C7B\u578B';
    pluralName: 'unit-types';
    singularName: 'unit-type';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    base_stats_modifier: Schema.Attribute.JSON;
    color_hex: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 7;
      }>;
    combat_advantages: Schema.Attribute.JSON;
    combat_disadvantages: Schema.Attribute.JSON;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Text;
    display_order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    formation_bonus: Schema.Attribute.JSON;
    heroes: Schema.Attribute.Relation<'oneToMany', 'api::hero.hero'>;
    icon_url: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    is_active: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::unit-type.unit-type'
    > &
      Schema.Attribute.Private;
    movement_type: Schema.Attribute.Enumeration<
      ['land', 'water', 'flying', 'mixed']
    > &
      Schema.Attribute.DefaultTo<'land'>;
    name_en: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 20;
      }>;
    name_zh: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 20;
      }>;
    publishedAt: Schema.Attribute.DateTime;
    range_type: Schema.Attribute.Enumeration<['melee', 'ranged', 'mixed']> &
      Schema.Attribute.DefaultTo<'melee'>;
    special_abilities: Schema.Attribute.JSON;
    terrain_modifier: Schema.Attribute.JSON;
    type_id: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 20;
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiUserCityPolicyUserCityPolicy
  extends Struct.CollectionTypeSchema {
  collectionName: 'user_city_policies';
  info: {
    description: '\u7528\u6237\u57CE\u6C60\u653F\u7B56\u5B9E\u65BD\u6570\u636E';
    displayName: '\u7528\u6237\u57CE\u6C60\u653F\u7B56';
    pluralName: 'user-city-policies';
    singularName: 'user-city-policy';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    administrative_burden: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    citizen_approval: Schema.Attribute.Float &
      Schema.Attribute.SetMinMax<
        {
          max: 1;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0.5>;
    city: Schema.Attribute.Relation<'manyToOne', 'api::city.city'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    daily_cost: Schema.Attribute.BigInteger &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    economic_impact: Schema.Attribute.Float & Schema.Attribute.DefaultTo<0>;
    effectiveness_score: Schema.Attribute.Float &
      Schema.Attribute.SetMinMax<
        {
          max: 1;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0.5>;
    efficiency_modifier: Schema.Attribute.Float &
      Schema.Attribute.SetMinMax<
        {
          max: 2;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1>;
    expires_at: Schema.Attribute.DateTime;
    implementation_level: Schema.Attribute.Float &
      Schema.Attribute.SetMinMax<
        {
          max: 1;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1>;
    implemented_at: Schema.Attribute.DateTime;
    last_review_at: Schema.Attribute.DateTime;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::user-city-policy.user-city-policy'
    > &
      Schema.Attribute.Private;
    policy: Schema.Attribute.Relation<
      'manyToOne',
      'api::city-policy.city-policy'
    >;
    policy_status: Schema.Attribute.Enumeration<
      ['active', 'suspended', 'planning', 'expired']
    > &
      Schema.Attribute.DefaultTo<'active'>;
    popularity_score: Schema.Attribute.Float &
      Schema.Attribute.SetMinMax<
        {
          max: 1;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0.5>;
    publishedAt: Schema.Attribute.DateTime;
    roi_score: Schema.Attribute.Float & Schema.Attribute.DefaultTo<0>;
    total_cost_spent: Schema.Attribute.BigInteger &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    unintended_consequences: Schema.Attribute.JSON;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiUserCityUserCity extends Struct.CollectionTypeSchema {
  collectionName: 'user_cities';
  info: {
    description: '\u7528\u6237\u57CE\u6C60\u5360\u9886\u548C\u53D1\u5C55\u6570\u636E';
    displayName: '\u7528\u6237\u57CE\u6C60';
    pluralName: 'user-cities';
    singularName: 'user-city';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    administrative_efficiency: Schema.Attribute.Float &
      Schema.Attribute.SetMinMax<
        {
          max: 1;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0.5>;
    battles_fought: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    battles_won: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    city: Schema.Attribute.Relation<'manyToOne', 'api::city.city'>;
    control_level: Schema.Attribute.Float &
      Schema.Attribute.SetMinMax<
        {
          max: 1;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    current_defense: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    current_loyalty: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    current_population: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    current_prosperity: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    daily_production: Schema.Attribute.JSON;
    defensive_improvements: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    development_focus: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 20;
      }>;
    development_level: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1>;
    development_points: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    disaster_status: Schema.Attribute.JSON;
    garrison_strength: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    governance_score: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<50>;
    infrastructure_level: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 10;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1>;
    last_battle_at: Schema.Attribute.DateTime;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::user-city.user-city'
    > &
      Schema.Attribute.Private;
    military_readiness: Schema.Attribute.Float &
      Schema.Attribute.SetMinMax<
        {
          max: 1;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0.5>;
    occupation_status: Schema.Attribute.Enumeration<
      ['controlled', 'contested', 'neutral', 'allied', 'enemy']
    > &
      Schema.Attribute.DefaultTo<'neutral'>;
    occupied_at: Schema.Attribute.DateTime;
    public_order: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<50>;
    publishedAt: Schema.Attribute.DateTime;
    reputation_score: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    resource_efficiency: Schema.Attribute.Float &
      Schema.Attribute.SetMinMax<
        {
          max: 2;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1>;
    siege_status: Schema.Attribute.Enumeration<
      ['none', 'under_siege', 'besieging']
    > &
      Schema.Attribute.DefaultTo<'none'>;
    special_events: Schema.Attribute.JSON;
    stored_resources: Schema.Attribute.JSON;
    tax_rate: Schema.Attribute.Float &
      Schema.Attribute.SetMinMax<
        {
          max: 1;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0.1>;
    total_investment: Schema.Attribute.BigInteger &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    total_revenue: Schema.Attribute.BigInteger &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiUserHeroUserHero extends Struct.CollectionTypeSchema {
  collectionName: 'user_heroes';
  info: {
    description: '\u7528\u6237\u62E5\u6709\u7684\u6B66\u5C06';
    displayName: '\u7528\u6237\u6B66\u5C06';
    pluralName: 'user-heroes';
    singularName: 'user-hero';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    breakthrough: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 4;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    exp: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    hero: Schema.Attribute.Relation<'manyToOne', 'api::hero.hero'>;
    is_favorite: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    level: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::user-hero.user-hero'
    > &
      Schema.Attribute.Private;
    position: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    power: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    publishedAt: Schema.Attribute.DateTime;
    skill_points: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    skill_tree: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>;
    star: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 6;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiUserItemUserItem extends Struct.CollectionTypeSchema {
  collectionName: 'user_items';
  info: {
    description: '\u7528\u6237\u80CC\u5305\u7269\u54C1\u6570\u636E';
    displayName: '\u7528\u6237\u7269\u54C1';
    pluralName: 'user-items';
    singularName: 'user-item';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    acquired_at: Schema.Attribute.DateTime & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    is_locked: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    item_template: Schema.Attribute.Relation<
      'manyToOne',
      'api::item-template.item-template'
    >;
    last_used: Schema.Attribute.DateTime;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::user-item.user-item'
    > &
      Schema.Attribute.Private;
    metadata: Schema.Attribute.JSON;
    publishedAt: Schema.Attribute.DateTime;
    quantity: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiUserProfileUserProfile extends Struct.CollectionTypeSchema {
  collectionName: 'user_profiles';
  info: {
    description: '\u7528\u6237\u6E38\u620F\u6863\u6848';
    displayName: '\u7528\u6237\u6863\u6848';
    pluralName: 'user-profiles';
    singularName: 'user-profile';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    arena_coin: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    avatar_url: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    diamond: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<500>;
    exp: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    friend_point: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    gold: Schema.Attribute.BigInteger & Schema.Attribute.DefaultTo<50000>;
    guild_coin: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    last_login_time: Schema.Attribute.DateTime;
    level: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::user-profile.user-profile'
    > &
      Schema.Attribute.Private;
    nickname: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    power: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    publishedAt: Schema.Attribute.DateTime;
    stamina: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<120>;
    stamina_update_time: Schema.Attribute.DateTime;
    total_login_days: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    vip_level: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
  };
}

export interface ApiUserResourceUserResource
  extends Struct.CollectionTypeSchema {
  collectionName: 'user_resources';
  info: {
    description: '\u7528\u6237\u8D44\u6E90\u7BA1\u7406\u6570\u636E';
    displayName: '\u7528\u6237\u8D44\u6E90';
    pluralName: 'user-resources';
    singularName: 'user-resource';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    daily_gained: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    daily_used: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    last_reset: Schema.Attribute.Date;
    last_update: Schema.Attribute.DateTime & Schema.Attribute.Required;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::user-resource.user-resource'
    > &
      Schema.Attribute.Private;
    max_quantity: Schema.Attribute.BigInteger;
    publishedAt: Schema.Attribute.DateTime;
    quantity: Schema.Attribute.BigInteger &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    resource_type: Schema.Attribute.Enumeration<
      [
        'gold',
        'gems',
        'energy',
        'honor',
        'guild_coins',
        'arena_tokens',
        'event_tokens',
        'enhancement_stones',
        'skill_books',
        'awakening_crystals',
        'hero_fragments',
        'equipment_materials',
      ]
    > &
      Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiUserSessionUserSession extends Struct.CollectionTypeSchema {
  collectionName: 'user_sessions';
  info: {
    description: '\u7528\u6237\u767B\u5F55\u4F1A\u8BDD\u7BA1\u7406\u6570\u636E';
    displayName: '\u7528\u6237\u4F1A\u8BDD';
    pluralName: 'user-sessions';
    singularName: 'user-session';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    device_info: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>;
    expires_at: Schema.Attribute.DateTime & Schema.Attribute.Required;
    ip_address: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 45;
      }>;
    is_active: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    last_active: Schema.Attribute.DateTime;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::user-session.user-session'
    > &
      Schema.Attribute.Private;
    login_type: Schema.Attribute.Enumeration<
      ['email', 'username', 'guest', 'social']
    > &
      Schema.Attribute.DefaultTo<'email'>;
    metadata: Schema.Attribute.JSON;
    publishedAt: Schema.Attribute.DateTime;
    refresh_token: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    token: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    user_agent: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
  };
}

export interface ApiUserStageProgressUserStageProgress
  extends Struct.CollectionTypeSchema {
  collectionName: 'user_stage_progresses';
  info: {
    description: '\u7528\u6237\u5173\u5361\u901A\u5173\u8FDB\u5EA6\u6570\u636E';
    displayName: '\u7528\u6237\u5173\u5361\u8FDB\u5EA6';
    pluralName: 'user-stage-progresses';
    singularName: 'user-stage-progress';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    battle_statistics: Schema.Attribute.JSON;
    best_score: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    clear_count: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    daily_attempts: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    fastest_clear_time: Schema.Attribute.Integer;
    first_clear_at: Schema.Attribute.DateTime;
    is_unlocked: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<false>;
    last_clear_at: Schema.Attribute.DateTime;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::user-stage-progress.user-stage-progress'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    rewards_claimed: Schema.Attribute.JSON;
    stage: Schema.Attribute.Relation<'manyToOne', 'api::stage.stage'>;
    stars: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 3;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    three_star_at: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface ApiWebsocketWebsocket extends Struct.SingleTypeSchema {
  collectionName: 'websockets';
  info: {
    description: 'WebSocket\u8FDE\u63A5\u7BA1\u7406\u548C\u914D\u7F6E';
    displayName: 'WebSocket\u7BA1\u7406';
    pluralName: 'websockets';
    singularName: 'websocket';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    connectionTimeout: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 10000;
        },
        number
      > &
      Schema.Attribute.DefaultTo<60000>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    enabled: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    heartbeatInterval: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 5000;
        },
        number
      > &
      Schema.Attribute.DefaultTo<30000>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::websocket.websocket'
    > &
      Schema.Attribute.Private;
    maxConnections: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1000>;
    publishedAt: Schema.Attribute.DateTime;
    settings: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginContentReleasesRelease
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_releases';
  info: {
    displayName: 'Release';
    pluralName: 'releases';
    singularName: 'release';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    actions: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release-action'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    releasedAt: Schema.Attribute.DateTime;
    scheduledAt: Schema.Attribute.DateTime;
    status: Schema.Attribute.Enumeration<
      ['ready', 'blocked', 'failed', 'done', 'empty']
    > &
      Schema.Attribute.Required;
    timezone: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginContentReleasesReleaseAction
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_release_actions';
  info: {
    displayName: 'Release Action';
    pluralName: 'release-actions';
    singularName: 'release-action';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentType: Schema.Attribute.String & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    entryDocumentId: Schema.Attribute.String;
    isEntryValid: Schema.Attribute.Boolean;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release-action'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    release: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::content-releases.release'
    >;
    type: Schema.Attribute.Enumeration<['publish', 'unpublish']> &
      Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginI18NLocale extends Struct.CollectionTypeSchema {
  collectionName: 'i18n_locale';
  info: {
    collectionName: 'locales';
    description: '';
    displayName: 'Locale';
    pluralName: 'locales';
    singularName: 'locale';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Schema.Attribute.String & Schema.Attribute.Unique;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::i18n.locale'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.SetMinMax<
        {
          max: 50;
          min: 1;
        },
        number
      >;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginReviewWorkflowsWorkflow
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_workflows';
  info: {
    description: '';
    displayName: 'Workflow';
    name: 'Workflow';
    pluralName: 'workflows';
    singularName: 'workflow';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentTypes: Schema.Attribute.JSON &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'[]'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    publishedAt: Schema.Attribute.DateTime;
    stageRequiredToPublish: Schema.Attribute.Relation<
      'oneToOne',
      'plugin::review-workflows.workflow-stage'
    >;
    stages: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow-stage'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginReviewWorkflowsWorkflowStage
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_workflows_stages';
  info: {
    description: '';
    displayName: 'Stages';
    name: 'Workflow Stage';
    pluralName: 'workflow-stages';
    singularName: 'workflow-stage';
  };
  options: {
    draftAndPublish: false;
    version: '1.1.0';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    color: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#4945FF'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow-stage'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String;
    permissions: Schema.Attribute.Relation<'manyToMany', 'admin::permission'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    workflow: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::review-workflows.workflow'
    >;
  };
}

export interface PluginUploadFile extends Struct.CollectionTypeSchema {
  collectionName: 'files';
  info: {
    description: '';
    displayName: 'File';
    pluralName: 'files';
    singularName: 'file';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    alternativeText: Schema.Attribute.String;
    caption: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    ext: Schema.Attribute.String;
    folder: Schema.Attribute.Relation<'manyToOne', 'plugin::upload.folder'> &
      Schema.Attribute.Private;
    folderPath: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    formats: Schema.Attribute.JSON;
    hash: Schema.Attribute.String & Schema.Attribute.Required;
    height: Schema.Attribute.Integer;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::upload.file'
    > &
      Schema.Attribute.Private;
    mime: Schema.Attribute.String & Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    previewUrl: Schema.Attribute.String;
    provider: Schema.Attribute.String & Schema.Attribute.Required;
    provider_metadata: Schema.Attribute.JSON;
    publishedAt: Schema.Attribute.DateTime;
    related: Schema.Attribute.Relation<'morphToMany'>;
    size: Schema.Attribute.Decimal & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url: Schema.Attribute.String & Schema.Attribute.Required;
    width: Schema.Attribute.Integer;
  };
}

export interface PluginUploadFolder extends Struct.CollectionTypeSchema {
  collectionName: 'upload_folders';
  info: {
    displayName: 'Folder';
    pluralName: 'folders';
    singularName: 'folder';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    children: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.folder'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    files: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.file'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::upload.folder'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    parent: Schema.Attribute.Relation<'manyToOne', 'plugin::upload.folder'>;
    path: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    pathId: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginUsersPermissionsPermission
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    role: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginUsersPermissionsRole
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'role';
    pluralName: 'roles';
    singularName: 'role';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.role'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    type: Schema.Attribute.String & Schema.Attribute.Unique;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    users: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.user'
    >;
  };
}

export interface PluginUsersPermissionsUser
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'user';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
    timestamps: true;
  };
  attributes: {
    blocked: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    confirmationToken: Schema.Attribute.String & Schema.Attribute.Private;
    confirmed: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.user'
    > &
      Schema.Attribute.Private;
    password: Schema.Attribute.Password &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    provider: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private;
    role: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    username: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ContentTypeSchemas {
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::permission': AdminPermission;
      'admin::role': AdminRole;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
      'admin::user': AdminUser;
      'api::arena-record.arena-record': ApiArenaRecordArenaRecord;
      'api::battle.battle': ApiBattleBattle;
      'api::chapter.chapter': ApiChapterChapter;
      'api::city-development-path.city-development-path': ApiCityDevelopmentPathCityDevelopmentPath;
      'api::city-policy.city-policy': ApiCityPolicyCityPolicy;
      'api::city-type.city-type': ApiCityTypeCityType;
      'api::city.city': ApiCityCity;
      'api::faction.faction': ApiFactionFaction;
      'api::friend-request.friend-request': ApiFriendRequestFriendRequest;
      'api::friendship.friendship': ApiFriendshipFriendship;
      'api::guild-member.guild-member': ApiGuildMemberGuildMember;
      'api::guild.guild': ApiGuildGuild;
      'api::hero.hero': ApiHeroHero;
      'api::item-template.item-template': ApiItemTemplateItemTemplate;
      'api::quality.quality': ApiQualityQuality;
      'api::resource-transaction.resource-transaction': ApiResourceTransactionResourceTransaction;
      'api::shop-item.shop-item': ApiShopItemShopItem;
      'api::shop.shop': ApiShopShop;
      'api::skill.skill': ApiSkillSkill;
      'api::stage-reward.stage-reward': ApiStageRewardStageReward;
      'api::stage.stage': ApiStageStage;
      'api::unit-type.unit-type': ApiUnitTypeUnitType;
      'api::user-city-policy.user-city-policy': ApiUserCityPolicyUserCityPolicy;
      'api::user-city.user-city': ApiUserCityUserCity;
      'api::user-hero.user-hero': ApiUserHeroUserHero;
      'api::user-item.user-item': ApiUserItemUserItem;
      'api::user-profile.user-profile': ApiUserProfileUserProfile;
      'api::user-resource.user-resource': ApiUserResourceUserResource;
      'api::user-session.user-session': ApiUserSessionUserSession;
      'api::user-stage-progress.user-stage-progress': ApiUserStageProgressUserStageProgress;
      'api::websocket.websocket': ApiWebsocketWebsocket;
      'plugin::content-releases.release': PluginContentReleasesRelease;
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction;
      'plugin::i18n.locale': PluginI18NLocale;
      'plugin::review-workflows.workflow': PluginReviewWorkflowsWorkflow;
      'plugin::review-workflows.workflow-stage': PluginReviewWorkflowsWorkflowStage;
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
    }
  }
}
