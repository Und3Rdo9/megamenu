/*!
* Mega Menu PLugin
*/
(function (root, factory) {
  if ( typeof define === 'function' && define.amd ) {
    define([], function () {
      return factory(root);
    });
  } else if ( typeof exports === 'object' ) {
    module.exports = factory(root);
  } else {
    root.MegaMenu = factory(root);
  }
})(typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : this, function (window) {

  'use strict';

  //
  // Shared Variables
  //

  var defaults = {
    megaMenuContainer:    '.mega-menu',
    topLevelClass:        'mega-menu__top-level-nav',
    topLevelItemClass:    'mega-menu__item--has-children',
    submenuClass:         'mega-menu__tabs-container',
    visibleSubmenuSuffix: '--visible',
    goBackToMainClass:    'mega-menu__go-back-to-main',
    tabListClass:         '.mega-menu__tab-list',
    tabToggleSelector:    '[data-toggle-tab]',
    tabsSelector:         '.mega-menu__tabs',
    tabPanelSelector:     '[data-tab]',
    tabPanelClass:        'mega-menu__tab-panel',
    activeClassSuffix:    '--active',
    breakpoint:           '(min-width: 768px)'
  };


  //
  // Shared Methods
  //

  /*!
  * Merge two or more objects together.
  * (c) 2017 Chris Ferdinandi, MIT License, https://gomakethings.com
  * @param   {Boolean}  deep     If true, do a deep (or recursive) merge [optional]
  * @param   {Object}   objects  The objects to merge together
  * @returns {Object}            Merged values of defaults and options
  */
  var extend = function () {

    // Variables
    var extended = {};
    var deep = false;
    var i = 0;

    // Check if a deep merge
    if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
      deep = arguments[0];
      i++;
    }

    // Merge the object into the extended object
    var merge = function (obj) {
      for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          // If property is an object, merge properties
          if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
            extended[prop] = extend(extended[prop], obj[prop]);
          } else {
            extended[prop] = obj[prop];
          }
        }
      }
    };

    // Loop through each object and conduct a merge
    for (; i < arguments.length; i++) {
      var obj = arguments[i];
      merge(obj);
    }

    return extended;

  };

  // nodeList forEach polyfill for IE browsers supporting ES5
  if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = function (callback, thisArg) {
      thisArg = thisArg || window;
      for (var i = 0; i < this.length; i++) {
        callback.call(thisArg, this[i], i, this);
      }
    };
  }

  var MegaMenu = function (options) {

    //
    // Unique Variables
    //

    var publicAPIs = {};
    // Merge options into defaults
    var settings = extend(defaults, options || {});

    var breakpoint = window.matchMedia(settings.breakpoint);

    console.log(breakpoint);


    this.elem = document.querySelectorAll(settings.megaMenuContainer)[0];

    if (!this.elem) {
      console.error('No valid megaMenuContainer found, please check your markup and the options.');
      return;
    }

    this.topLevelNav = this.elem.getElementsByClassName(settings.topLevelClass)[0];
    this.tabsContainers = this.elem.getElementsByClassName(settings.submenuClass);
    this.tabs = this.elem.querySelectorAll(settings.tabPanelSelector);
    this.activeTab = undefined;

    this.adjustHeight = function (visibleElement) {

      var newHeight = visibleElement.offsetHeight;
      this.elem.style.height = newHeight + 'px';
    };

    this.toggleSubmenu = function (item) {
      // toggle a submenu here
      this.hideAllSubmenus();
      if (item) {
        this.topLevelNav.classList.toggle(settings.topLevelClass + settings.activeClassSuffix);
        var submenu = item.getElementsByClassName(settings.submenuClass)[0];
        this.showSubmenu(submenu);
      }
      else {
        this.topLevelNav.classList.remove(settings.topLevelClass + settings.activeClassSuffix);
        this.adjustHeight(this.topLevelNav);
      }
    };

    this.hideAllSubmenus = function () {
      console.log('hiding all submenus');
      for (var i = 0; i < this.tabsContainers.length; i++) {
        this.tabsContainers[i].classList.remove(settings.submenuClass + settings.visibleSubmenuSuffix);
      }
    };

    this.showSubmenu = function (submenu) {
      console.log('showing submenu');
      submenu.classList.add(settings.submenuClass + settings.visibleSubmenuSuffix);
      this.adjustHeight(submenu);
    }

    this.toggleTabs = function(currentToggleTarget) {
      console.log('toggling : ', currentToggleTarget);
      // Variables
      var tab = document.querySelector('[data-tab="'+currentToggleTarget+'"]'); // The selected tab
      if ( !tab ) return;

      // Show or hide each tab
      this.tabs.forEach( function (tab) {

        var tabTarget = tab.getAttribute('data-tab');
        // If this is the selected tab, toggle it
        if ( tabTarget === currentToggleTarget ) {
          console.log('match');
          this.activeTab = this.activeTab !== currentToggleTarget ? currentToggleTarget : undefined;
          this.toggleTab(tab);
          this.toggleTabParent(tab);
          return;
        }

        // Otherwise, hide it
        tab.classList.remove( settings.tabPanelClass + settings.activeClassSuffix );
      }.bind(this));
    }

    this.toggleTabParent = function (tab) {
      var tabParent = tab.closest('.' + settings.submenuClass);
      if (!tabParent) return;
      // add classes if an activeTab is currently undefined
      // remove active classes otherwise
      tabParent.classList.toggle(settings.submenuClass + settings.activeClassSuffix, this.activeTab);
      if (!this.activeTab) {
        this.adjustHeight(tabParent);
      }
    };

    this.toggleTab = function (tab) {
      if (!tab) return;
      // add classes if an activeTab is currently undefined
      // remove active classes otherwise
      tab.classList.toggle(settings.tabPanelClass + settings.activeClassSuffix, this.activeTab);
      // set megaMenu height to tab if active
      // set megaMenu to height of parent if no tab is active
      if (this.activeTab) {
        this.adjustHeight(tab);
      }
    };

    this.handleToggleTab = function (e) {
      var currentToggleTarget = e.target.getAttribute('data-toggle-tab');
      this.toggleTabs(currentToggleTarget);
    };

    this.handleEvents = function (e) {
      console.log('handling event for =>', e);
      var target = e.target;

      // bail if document interaction is not within mega menu
      if (!(target.closest(settings.megaMenuContainer))) return;

      var type = e.type;
      // bail if event type is mouseover but we are still on mobile resolution
      if (type === 'mouseover' && !(breakpoint.matches)) return;

      // check if we click on most deeply nested element with action
      // otherwise, continue up the DOM tree...
      if (target.classList.contains('mega-menu__go-back-to-tab-list') && type === 'click') {
        this.toggleTabs(this.activeTab);
        return;
      }

      // check if click inside a tab of the mega menu
      // avoid any further actions
      // proceed with default action of clicked element
      if (target.classList.contains('mega-menu__tabs') || target.closest('.mega-menu__tabs')) {
        console.log('clicked inside tabs content container');
        return true; // do whatever
      }

      // toggle a tab when clicked/hovered on a toggle
      if (target.matches(settings.tabToggleSelector)) {
        e.preventDefault(); // prevent link if any
        this.handleToggleTab(e);
        return;
      }

      // go back to main menu event
      if (target.classList.contains(settings.goBackToMainClass) && type === 'click') {
        this.toggleSubmenu.bind(this, null)();
        return;
      }

      // main menu item click/hover event
      // check if we clicked on the li parent
      // or if we still need to find the closest li parent
      if (!target.classList.contains(settings.topLevelItemClass) && target.closest('.' + settings.topLevelItemClass)) {
        e.preventDefault(); // prevent link if any
        target = target.closest('.' + settings.topLevelItemClass);
        this.toggleSubmenu(target, e);
        return;
      }
      // we clicked on the li directly
      else if (target.classList.contains(settings.topLevelItemClass)){
        e.preventDefault(); // prevent link if any
        this.toggleSubmenu(target, e);
        return;
      }
    }

    this.bindListeners = function () {
      document.addEventListener('click', this.handleEvents.bind(this), false);
      document.addEventListener('mouseover', this.handleEvents.bind(this));
    };

    this.removeListeners = function () {
      document.removeEventListener('click', this.handleEvents.bind(this), false);
    }

    this.init = function (options) {
      this.bindListeners();
    };

    this.destroy = function () {
      this.removeListeners();
    };

    // Initialize the plugin
    this.init(options);

    // Return the public APIs
    return this;

  };


  //
  // Return the constructor
  //

  return MegaMenu;

});
