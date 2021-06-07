// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.

import Rails from "@rails/ujs"
import * as ActiveStorage from "@rails/activestorage"
import "channels"

import Backbone from 'backbone'

Rails.start()
ActiveStorage.start()

Backbone._sync = Backbone.sync;
Backbone.sync = function(method, model, options) {
  if (!options.noCSRF) {
    var beforeSend = options.beforeSend;

    options.beforeSend = function(xhr) {
      var token = $('meta[name="csrf-token"]').attr('content');
      if (token) {xhr.setRequestHeader('X-CSRF-Token', token);}
      if (beforeSend) {return beforeSend.apply(this, arguments);}
    };
  }
  return Backbone._sync(method, model, options);
};
require('router');