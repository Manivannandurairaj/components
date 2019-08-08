/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FocusMonitor} from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
  Optional,
  Inject,
  Input,
} from '@angular/core';
import {
  CanColor,
  CanDisable,
  CanDisableRipple,
  CanColorCtor,
  CanDisableCtor,
  CanDisableRippleCtor,
  MatRipple,
  mixinColor,
  mixinDisabled,
  mixinDisableRipple,
} from '@mani/material/core';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';

/** Default color palette for round buttons (mani-fab and mani-mini-fab) */
const DEFAULT_ROUND_BUTTON_COLOR = 'accent';

/**
 * List of classes to add to ManiButton instances based on host attributes to
 * style as different variants.
 */
const BUTTON_HOST_ATTRIBUTES = [
  'mani-button',
  'mani-flat-button',
  'mani-icon-button',
  'mani-raised-button',
  'mani-stroked-button',
  'mani-mini-fab',
  'mani-fab',
];

// Boilerplate for applying mixins to ManiButton.
/** @docs-private */
class ManiButtonBase {
  constructor(public _elementRef: ElementRef) {}
}

const _ManiButtonMixinBase: CanDisableRippleCtor & CanDisableCtor & CanColorCtor &
    typeof ManiButtonBase = mixinColor(mixinDisabled(mixinDisableRipple(ManiButtonBase)));

/**
 * Material design button.
 */
@Component({
  moduleId: module.id,
  selector: `button[mani-button], button[mani-raised-button], button[mani-icon-button],
             button[mani-fab], button[mani-mini-fab], button[mani-stroked-button],
             button[mani-flat-button]`,
  exportAs: 'ManiButton',
  host: {
    '[attr.disabled]': 'disabled || null',
    '[class._mani-animation-noopable]': '_animationMode === "NoopAnimations"',
  },
  templateUrl: 'button.html',
  styleUrls: ['button.css'],
  inputs: ['disabled', 'disableRipple', 'color'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManiButton extends _ManiButtonMixinBase
    implements OnDestroy, CanDisable, CanColor, CanDisableRipple {

  /** Whether the button is round. */
  readonly isRoundButton: boolean = this._hasHostAttributes('mani-fab', 'mani-mini-fab');

  /** Whether the button is icon button. */
  readonly isIconButton: boolean = this._hasHostAttributes('mani-icon-button');

  /** Reference to the MatRipple instance of the button. */
  @ViewChild(MatRipple, {static: false}) ripple: MatRipple;

  constructor(elementRef: ElementRef,
              private _focusMonitor: FocusMonitor,
              @Optional() @Inject(ANIMATION_MODULE_TYPE) public _animationMode: string) {
    super(elementRef);

    // For each of the variant selectors that is prevent in the button's host
    // attributes, add the correct corresponding class.
    for (const attr of BUTTON_HOST_ATTRIBUTES) {
      if (this._hasHostAttributes(attr)) {
        (this._getHostElement() as HTMLElement).classList.add(attr);
      }
    }

    this._focusMonitor.monitor(this._elementRef, true);

    if (this.isRoundButton) {
      this.color = DEFAULT_ROUND_BUTTON_COLOR;
    }
  }

  ngOnDestroy() {
    this._focusMonitor.stopMonitoring(this._elementRef);
  }

  /** Focuses the button. */
  focus(): void {
    this._getHostElement().focus();
  }

  _getHostElement() {
    return this._elementRef.nativeElement;
  }

  _isRippleDisabled() {
    return this.disableRipple || this.disabled;
  }

  /** Gets whether the button has one of the given attributes. */
  _hasHostAttributes(...attributes: string[]) {
    return attributes.some(attribute => this._getHostElement().hasAttribute(attribute));
  }
}

/**
 * Material design anchor button.
 */
@Component({
  moduleId: module.id,
  selector: `a[mani-button], a[mani-raised-button], a[mani-icon-button], a[mani-fab],
             a[mani-mini-fab], a[mani-stroked-button], a[mani-flat-button]`,
  exportAs: 'ManiButton, matAnchor',
  host: {
    // Note that we ignore the user-specified tabindex when it's disabled for
    // consistency with the `mani-button` applied on native buttons where even
    // though they have an index, they're not tabbable.
    '[attr.tabindex]': 'disabled ? -1 : (tabIndex || 0)',
    '[attr.disabled]': 'disabled || null',
    '[attr.aria-disabled]': 'disabled.toString()',
    '(click)': '_haltDisabledEvents($event)',
    '[class._mani-animation-noopable]': '_animationMode === "NoopAnimations"',
  },
  inputs: ['disabled', 'disableRipple', 'color'],
  templateUrl: 'button.html',
  styleUrls: ['button.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatAnchor extends ManiButton {
  /** Tabindex of the button. */
  @Input() tabIndex: number;

  constructor(
    focusMonitor: FocusMonitor,
    elementRef: ElementRef,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode: string) {
    super(elementRef, focusMonitor, animationMode);
  }

  _haltDisabledEvents(event: Event) {
    // A disabled button shouldn't apply any actions
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
}
