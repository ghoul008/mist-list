/* eslint-disable lit/no-legacy-template-syntax */
import '@polymer/polymer/polymer-legacy.js';
import '@polymer/paper-button/paper-button.js';
import { IronResizableBehavior } from '@polymer/iron-resizable-behavior/iron-resizable-behavior.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';

Polymer({
  _template: html`
    <style include="shared-styles">
      :host {
        display: flex;
        color: inherit;
        align-items: center;
        justify-content: flex-end;
        flex-wrap: nowrap;
        fill: inherit;
        width: 100%;
      }

      paper-button.actions {
        display: inline-flex;
        flex-wrap: nowrap;
        white-space: nowrap;
        /* min-width: auto;
        width: auto; */
        overflow: hidden;
        text-overflow: ellipsis;
        fill: inherit;
      }

      paper-button.more.actions {
        display: block;
        width: 100%;
        margin-left: 0 !important;
      }

      paper-button.actions iron-icon {
        fill: inherit;
      }

      paper-button.more.actions iron-icon {
        fill: rgba(0, 0, 0, 0.54);
      }

      paper-menu-button {
        padding: 0;
      }

      iron-icon {
        color: inherit;
        min-width: 24px;
        padding-right: 8px;
      }

      paper-dialog-scrollable ul {
        padding-left: 18px;
        color: rgba(0, 0, 0, 0.54);
        font-size: 16px;
      }

      div.dropdown-content {
        color: rgba(0, 0, 0, 0.87);
      }

      div.dropdown-content paper-button {
        text-align: left;
        white-space: nowrap;
        padding: 16px 16px;
        margin-left: 16px;
      }

      paper-button.dropdown-trigger {
        min-width: auto !important;
        padding: 0.8em;
      }

      @media screen and (max-width: 600px) {
        paper-button#actionmenu ::content iron-icon,
        paper-button#actionmenu ::slotted(iron-icon) {
          margin: 0 !important;
        }

        paper-button.dropdown-trigger {
          padding: 8px !important;
        }
      }
    </style>
    <template is="dom-if" if="[[_hasActions(topActions.length)]]" restamp="">
      <template is="dom-repeat" items="[[topActions]]" as="action">
        <paper-button on-tap="_selectAction" class="visible actions">
          <iron-icon icon="[[action.icon]]" hidden$="[[!action.icon]]"></iron-icon>
          <span>[[action.name]]</span>
        </paper-button>
      </template>
    </template>
    <template is="dom-if" if="[[_hasActions(moreActions.length)]]" restamp="">
      <paper-menu-button id="actionmenu" horizontal-align="right" vertical-offset="40">
        <paper-button class="dropdown-trigger" slot="dropdown-trigger">
          <iron-icon icon="more-vert"></iron-icon>
        </paper-button>
        <div class="dropdown-content" slot="dropdown-content">
          <template is="dom-repeat" items="[[moreActions]]" as="action">
            <paper-button on-tap="_selectAction" class="more actions">
              <iron-icon icon="[[action.icon]]" hidden$="[[!action.icon]]"></iron-icon>
              <span>[[action.name]]</span>
            </paper-button>
          </template>
        </div>
      </paper-menu-button>
    </template>
  `,

  is: 'mist-list-actions',

  behaviors: [IronResizableBehavior],

  properties: {
    actions: {
      type: Array,
    },
    selectedAction: {
      type: Object,
    },
    visibleActions: {
      type: Number,
      value: 3,
    },
    topActions: {
      type: Array,
      computed: '_computeTopActions(actions, visibleActions)',
      value() {
        return [];
      },
    },
    moreActions: {
      type: Array,
      computed: '_computeMoreActions(actions, visibleActions)',
      value() {
        return [];
      },
    },
    useHalfWidth: {
      type: Boolean,
      reflectToAttribute: true,
    },
  },

  observers: ['_actionsChanged(actions)'],

  listeners: {
    'iron-resize': '_updateVisibleActions',
    'list-resize': '_updateVisibleActions',
    resize: '_updateVisibleActions',
  },

  attached() {
    this._updateVisibleActions();
  },

  _selectAction(e) {
    if (this.shadowRoot.querySelector('paper-menu-button#actionmenu')) {
      this.shadowRoot.querySelector('paper-menu-button#actionmenu').close();
    }
    if (e.model.action) {
      this.set('selectedAction', e.model.action);
      this.fire('select-action', {
        action: e.model.action,
      });
    }
  },

  _actionsChanged(actions) {
    if (actions) {
      this._updateVisibleActions();
    }
  },

  _computeTopActions() {
    if (this.actions) return this.actions.slice(0, this.visibleActions);
    return undefined;
  },

  _computeMoreActions() {
    if (this.actions) return this.actions.slice(this.visibleActions);
    return undefined;
  },

  _updateVisibleActions() {
    console.log('_updateVisibleActions', Math.floor(this.offsetWidth - 50) / 150);
    this.set('visibleActions', Math.floor(this.offsetWidth - 50) / 150);
  },

  _hasActions(length) {
    return length > 0;
  },
});
