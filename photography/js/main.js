 AOS.init({
 	duration: 800,
 	easing: 'slide',
 	once: true
 });

jQuery(document).ready(function($) {

	"use strict";

	// Mobile Menu Functionality
	var body = document.querySelector('body');
	var siteMenuToggles = document.querySelectorAll('.js-menu-toggle');
	var mobileMenu = document.querySelector('.site-mobile-menu');

	// Toggle menu when clicking hamburger or close button
	siteMenuToggles.forEach(function(toggle) {
		toggle.addEventListener('click', function(e) {
			e.preventDefault();
			e.stopPropagation();
			body.classList.toggle('offcanvas-menu');
		});
	});

	// Close menu when clicking outside
	document.addEventListener('click', function(e) {
		if (body.classList.contains('offcanvas-menu')) {
			if (!mobileMenu.contains(e.target) && !e.target.classList.contains('js-menu-toggle')) {
				body.classList.remove('offcanvas-menu');
			}
		}
	});

	// Prevent clicks inside menu from closing it
	mobileMenu.addEventListener('click', function(e) {
		e.stopPropagation();
	});

	// Handle dropdown toggles in mobile menu
	var dropdownToggles = document.querySelectorAll('.site-mobile-menu .has-children > a');
	dropdownToggles.forEach(function(toggle) {
		toggle.addEventListener('click', function(e) {
			e.preventDefault();
			var parent = this.parentElement;
			parent.classList.toggle('active');
			
			// Close other open dropdowns
			dropdownToggles.forEach(function(otherToggle) {
				var otherParent = otherToggle.parentElement;
				if (otherParent !== parent && otherParent.classList.contains('active')) {
					otherParent.classList.remove('active');
				}
			});
		});
	});
});