import { PolymerElement, html } from '@polymer/polymer/polymer-element';
import { store } from '../../../redux/store';
import { connect } from 'pwa-helpers/connect-mixin';

import { setJourney } from '../../../redux/actions/journey';
import { selectPage } from '../../../redux/actions/application';
import { clearAddressData } from '../../../redux/actions/address';

import '../../style-element.js';
import css from './style.pcss';
import template from './template.html';

import '../../objects/maf-screen';
import '../../lib/maki/maki-input';
import '../../lib/maki-icons/maki-icon-truck';
import '../../lib/maki-icons/maki-icon-bulb';

var MobileDetect = require('mobile-detect');
var detectMobile = new MobileDetect(window.navigator.userAgent);

export default class MafScreenJourneys extends connect(store)(PolymerElement) {
  static get properties() {
    return {};
  }

  static get template() {
    return html([`<style include="style-element">${css}</style> ${template}`]);
  }

  constructor() {
    super();
  }

  _onBack() {
    store.dispatch(selectPage('home'));
  }

  _selectJourneyA() {
    this._selectJourney(0);
  }
  _selectJourneyB() {
    this._selectJourney(1);
  }
  _selectJourney(index) {
    store.dispatch(setJourney(this.journeys[index]));
    store.dispatch(selectPage('journey'));
    store.dispatch(clearAddressData());
  }

  focusOnSearch() {
    if (!detectMobile.mobile()) {
      this.shadowRoot.querySelector('#SearchInput').focus();
    }
  }

  stateChanged(state) {
    this.journeys = state.journeys.data;
  }
}

window.customElements.define('maf-screen-journeys', MafScreenJourneys);
