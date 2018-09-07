/**
 * @license
 * Copyright 2017 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import {MDCComponent} from '@material/base/index';
import {MDCRipple} from '@material/ripple/index';

import MDCDialogFoundation from './foundation';
import MDCDialogUtil from './util';

const strings = MDCDialogFoundation.strings;

class MDCDialog extends MDCComponent {
  constructor(...args) {
    super(...args);

    /**
     * @type {!Array<!MDCRipple>}
     * @private
     */
    this.buttonRipples_;

    /** @private {!Array<!Element>} */
    this.buttons_;

    /** @private {!Element} */
    this.container_;

    /** @private {?Element} */
    this.content_;

    /** @private {!FocusTrapInstance} */
    this.focusTrap_;

    /** @private {!MDCDialogUtil} */
    this.util_;

    /** @private {!Function} */
    this.handleClick_;

    /** @private {!Function} */
    this.handleKeydown_;

    /** @private {!Function} */
    this.handleOpening_;

    /** @private {!Function} */
    this.handleClosing_;

    /** @private {Function} */
    this.handleWindowResize_;
  }

  static attachTo(root) {
    return new MDCDialog(root);
  }

  get open() {
    return this.foundation_.isOpen();
  }

  set open(isOpen) {
    if (isOpen) {
      this.foundation_.open();
    } else {
      this.foundation_.close();
    }
  }

  get escapeKeyAction() {
    return this.foundation_.getEscapeKeyAction();
  }

  set escapeKeyAction(action) {
    this.foundation_.setEscapeKeyAction(action);
  }

  get scrimClickAction() {
    return this.foundation_.getScrimClickAction();
  }

  set scrimClickAction(action) {
    this.foundation_.setScrimClickAction(action);
  }

  initialize() {
    this.util_ = this.util_ || new MDCDialogUtil();
    this.container_ = /** @type {!Element} */ (this.root_.querySelector(strings.CONTAINER_SELECTOR));
    this.content_ = this.root_.querySelector(strings.CONTENT_SELECTOR);
    this.buttons_ = [].slice.call(this.root_.querySelectorAll(strings.BUTTON_SELECTOR));
    this.focusTrap_ = this.util_.createFocusTrapInstance(this.container_);
    this.buttonRipples_ = [];

    for (let i = 0, buttonEl; buttonEl = this.buttons_[i]; i++) {
      this.buttonRipples_.push(new MDCRipple(buttonEl));
    }
  }

  initialSyncWithDOM() {
    this.handleClick_ = this.foundation_.handleClick.bind(this.foundation_);
    this.handleKeydown_ = this.foundation_.handleKeydown.bind(this.foundation_);
    this.handleWindowResize_ = () => this.foundation_.layout();

    const WINDOW_EVENTS = ['resize', 'orientationchange'];
    this.handleOpening_ = () => {
      WINDOW_EVENTS.forEach((type) => window.addEventListener(type, this.handleWindowResize_));
    };
    this.handleClosing_ = () => {
      WINDOW_EVENTS.forEach((type) => window.removeEventListener(type, this.handleWindowResize_));
    };

    this.listen('click', this.handleClick_);
    this.listen('keydown', this.handleKeydown_);
    this.listen(strings.OPENING_EVENT, this.handleOpening_);
    this.listen(strings.CLOSING_EVENT, this.handleClosing_);
  }

  destroy() {
    this.unlisten('click', this.handleClick_);
    this.unlisten('keydown', this.handleKeydown_);
    this.unlisten(strings.OPENING_EVENT, this.handleOpening_);
    this.unlisten(strings.CLOSING_EVENT, this.handleClosing_);
    this.handleClosing_();

    this.buttonRipples_.forEach((ripple) => ripple.destroy());
    super.destroy();
  }

  layout() {
    this.foundation_.layout();
  }

  show() {
    this.foundation_.open();
  }

  /**
   * @param {string|undefined=} action
   */
  close(action = undefined) {
    this.foundation_.close(action);
  }

  getDefaultFoundation() {
    return new MDCDialogFoundation({
      addClass: (className) => this.root_.classList.add(className),
      removeClass: (className) => this.root_.classList.remove(className),
      addBodyClass: (className) => document.body.classList.add(className),
      removeBodyClass: (className) => document.body.classList.remove(className),
      eventTargetHasClass: (target, className) => target.classList.contains(className),
      computeBoundingRect: () => this.root_.getBoundingClientRect(),
      trapFocus: () => this.focusTrap_.activate(),
      releaseFocus: () => this.focusTrap_.deactivate(),
      isContentScrollable: () => !!this.content_ && this.util_.isScrollable(/** @type {!Element} */ (this.content_)),
      areButtonsStacked: () => this.util_.areTopsMisaligned(this.buttons_),
      getActionFromEvent: (event) => event.target.getAttribute(strings.ACTION_ATTRIBUTE),
      notifyOpening: () => this.emit(strings.OPENING_EVENT, {}),
      notifyOpened: () => this.emit(strings.OPENED_EVENT, {}),
      notifyClosing: (action = undefined) => this.emit(strings.CLOSING_EVENT, {action}),
      notifyClosed: (action = undefined) => this.emit(strings.CLOSED_EVENT, {action}),
    });
  }
}

export {MDCDialog, MDCDialogFoundation, MDCDialogUtil};
