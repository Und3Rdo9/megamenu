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
    breakpoint:           '(min-width: 764px)'
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


    this.elem = document.querySelectorAll(settings.megaMenuContainer)[0];

    if (!this.elem) {
      console.error('No valid megaMenuContainer found, please check your markup and the options.');
      return;
    }

    this.topLevelNav = this.elem.getElementsByClassName(settings.topLevelClass)[0];
    this.topLevelItems = this.elem.getElementsByClassName(settings.topLevelItemClass);
    this.tabsContainers = this.elem.getElementsByClassName(settings.submenuClass);
    this.backToMainButtons = this.elem.getElementsByClassName(settings.goBackToMainClass);
    this.tabToggles = this.elem.querySelectorAll(settings.tabToggleSelector);
    this.tabs = this.elem.querySelectorAll(settings.tabPanelSelector);

    this.adjustHeight = function (visibleElement) {

      var newHeight = visibleElement.offsetHeight;
      this.elem.style.height = newHeight + 'px';
    };

    this.toggleSubmenu = function (item, e) {
      // toggle a submenu here
      this.hideAllSubmenus();
      if (item) {
        this.topLevelNav.classList.toggle(settings.topLevelClass + settings.activeClassSuffix);
        var submenu = item.getElementsByClassName(settings.submenuClass)[0];
        this.showSubmenu(submenu);
      }
      else {
        e.stopPropagation(); // stop from propagating events to elements higher in the DOM tree
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

    this.toggleTabs = function(currentToggleTarget, allTabs) {
      // Variables
      var tab = document.querySelector('[data-tab="'+currentToggleTarget+'"]'); // The selected tab
      if ( !tab ) return;
      var tabParent = tab.closest('.' + settings.submenuClass);

      // Show or hide each tab
      allTabs.forEach( function (tab) {

        var tabTarget = tab.getAttribute('data-tab');
        // If this is the selected tab, show it
        if ( tabTarget === currentToggleTarget ) {
          tab.classList.add(settings.tabPanelClass + settings.activeClassSuffix );

          tabParent.classList.add(settings.submenuClass + settings.activeClassSuffix);
          this.adjustHeight(tab);
          return;
        }

        // Otherwise, hide it
        tab.classList.remove( settings.tabPanelClass + settings.activeClassSuffix );
      });
    }

    this.toggleTabsParent = function (tab) {

    };

    this.toggleTab = function (e) {
      var currentToggleTarget = e.target.getAttribute('data-toggle-tab');
      toggleTabs(currentToggleTarget, this.tabs);
      e.stopPropagation();
    };

    var handleTopLevelItemInteraction = function (e) {
      console.log('handling top level interaction');
      e.preventDefault(); // prevent link if any

      // TO-DO: add click / hover distinction for mobile/desktop breakpoints

      var target =  e.target;

      // check if we clicked on the li parent
      // or if we still need to find the closest li parent
      if (!target.classList.contains(settings.topLevelItemClass) && target.closest('.' + settings.topLevelItemClass)) {
        target = target.closest('.' + settings.topLevelItemClass);
      }
      else {
        //
      }

      this.toggleSubmenu(target, e);
    };

    /**
    * A private method
    */
    var bindListeners = function () {
      for (var i = 0; i < this.topLevelItems.length; i++) {
        this.topLevelItems[i].addEventListener('click', handleTopLevelItemInteraction.bind(this), false);
      }

      for (var k = 0; k < this.backToMainButtons.length; k++) {
        this.backToMainButtons[k].addEventListener('click', this.toggleSubmenu.bind(this, null), true);
      }

      for (var l = 0; l < this.tabToggles.length; l++) {
        this.tabToggles[l].addEventListener('click', this.toggleTab.bind(this), true);
      }

    };

    var removeListeners = function () {
      for (var j = 0; j < this.topLevelItems.length; j++) {
        this.topLevelItems[j].removeEventListener('click', handleTopLevelItemInteraction);
      }

      for (var i = 0; i < this.backToMainButtons.length; i++) {
        this.backToMainButtons[i].removeEventListener('click', this.toggleSubmenu);
      }
    }

    /**
    * A public method
    */
    // publicAPIs.doSomething = function () {
    // 	somePrivateMethod();
    // 	// Code goes here...
    // };

    /**
    * Another public method
    */
    this.init = function (options) {

      bindListeners.bind(this)();


      // Code goes here...

      //alert('it works');

    };

    this.destroy = function () {
      removeListeners.bind(this)();
    }

    // Initialize the plugin
    this.init(options);

    // Return the public APIs
    return publicAPIs;

  };


  //
  // Return the constructor
  //

  return MegaMenu;

});
