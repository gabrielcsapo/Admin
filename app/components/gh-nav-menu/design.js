import Component from '@glimmer/component';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import {task} from 'ember-concurrency-decorators';
import {tracked} from '@glimmer/tracking';

export default class DesignMenuComponent extends Component {
    @service config;
    @service customThemeSettings;
    @service router;
    @service settings;
    @service themeManagement;

    @tracked openSection = null;

    KNOWN_GROUPS = [{
        key: 'homepage',
        name: 'Homepage',
        icon: 'house'
    }, {
        key: 'post',
        name: 'Post',
        icon: 'post'
    }];

    constructor() {
        super(...arguments);
        this.fetchThemeSettingsTask.perform();
        this.themeManagement.updatePreviewHtmlTask.perform();
    }

    get themeSettings() {
        return this.customThemeSettings.settings;
    }

    get settingGroups() {
        const groupKeys = this.KNOWN_GROUPS.map(g => g.key);
        const groups = [];

        const siteWideSettings = this.themeSettings.filter(setting => !groupKeys.includes(setting.group));
        if (siteWideSettings.length) {
            groups.push({
                key: 'site-wide',
                name: 'Site-wide',
                icon: 'view-site',
                settings: siteWideSettings
            });
        }

        this.KNOWN_GROUPS.forEach((knownGroup) => {
            const settings = this.themeSettings.filter(setting => setting.group === knownGroup.key);

            if (settings.length) {
                groups.push(Object.assign({}, knownGroup, {settings}));
            }
        });

        return groups;
    }

    @action
    toggleSection(section) {
        if (this.openSection === section) {
            this.openSection = null;
        } else {
            this.openSection = section;
        }
    }

    @task
    *fetchThemeSettingsTask() {
        yield this.customThemeSettings.load();
    }

    @action
    transitionBackToIndex() {
        if (this.router.currentRouteName !== 'settings.design.index') {
            this.router.transitionTo('settings.design.index');
        }
    }
}
