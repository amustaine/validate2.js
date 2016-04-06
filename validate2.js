/*
 * validate2.js 0.0.2
 * 
 * (c) Alex Buturlakin alexbuturlakin@gmail.com
 */
(function (window, document, undefined) {
  /*
   * Use the setMessage() function to overwrite specific messages.
   * Or $.validatorMessages() if you use jquery
   * Or set message directly in rule
   * 
   * "{0}" - field name, {1...} - rule parameters
   */
  var defaults = {
    messages: {
      required: 'The {0} field is required.',
      matches: 'The {0} field does not match the {1} field.',
      "default": 'The {0} field is still set to default, please change.',
      valid_email: 'The {0} field must contain a valid email address.',
      valid_emails: 'The {0} field must contain all valid email addresses.',
      english: 'The {0} field must contain only english characters',
      company_name: 'The {0} field shoould be a valid comapny name',
      min_length: 'The {0} field must be at least {1} characters in length.',
      max_length: 'The {0} field must not exceed {1} characters in length.',
      exact_length: 'The {0} field must be exactly {1} characters in length.',
      length_one_or_two: 'The {0} field must be exactly {1} or {2} characters in length.',
      greater_than: 'The {0} field must contain a number greater than {1}.',
      less_than: 'The {0} field must contain a number less than {1}.',
      alpha: 'The {0} field must only contain alphabetical characters.',
      alpha_numeric: 'The {0} field must only contain alpha-numeric characters.',
      alpha_dash: 'The {0} field must only contain alpha-numeric characters, underscores, and dashes.',
      numeric: 'The {0} field must contain only numbers.',
      integer: 'The {0} field must contain an integer.',
      decimal: 'The {0} field must contain a decimal number.',
      is_natural: 'The {0} field must contain only positive numbers.',
      is_natural_no_zero: 'The {0} field must contain a number greater than zero.',
      valid_ip: 'The {0} field must contain a valid IP.',
      valid_base64: 'The {0} field must contain a base64 string.',
      valid_credit_card: 'The {0} field must contain a valid credit card number.',
      is_file_type: 'The {0} field must contain only {1} files.',
      valid_url: 'The {0} field must contain a valid URL.',
      greater_than_date: 'The {0} field must contain a more recent date than {1}.',
      less_than_date: 'The {0} field must contain an older date than {1}.',
      greater_than_or_equal_date: 'The {0} field must contain a date that\'s at least as recent as {1}.',
      less_than_or_equal_date: 'The {0} field must contain a date that\'s {1} or older.',
      password: 'At least eight characters: one number and one uppercase or lowercase English or Hebrew letter.',
      one_word: 'The {0} field must contain only one word.',
      two_words: 'The {0} field must contain only two words.',
      words_count: 'The {0} field must contain only {1} words.',
      words_count_max: 'The {0} field must contain a words less than {1}.',
      words_count_min: 'The {0} field must have at least {1} words.'
    },
    formCallback: function (status, errors) { },
    fieldCallback: function (status, field, errors) { }
  };

  /*
   * Define the regular expressions that will be used
   */
  var ruleRegex = /^(.+?)\[(.+)\]$/,
      numericRegex = /^[0-9]+$/,
      integerRegex = /^\-?[0-9]+$/,
      decimalRegex = /^\-?[0-9]*\.?[0-9]+$/,
      emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  // emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
      alphaRegex = /^[a-z]+$/i,
      alphaNumericRegex = /^[a-z0-9]+$/i,
      alphaDashRegex = /^[a-z0-9_\-]+$/i,
      naturalRegex = /^[0-9]+$/i,
      naturalNoZeroRegex = /^[1-9][0-9]*$/i,
      ipRegex = /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/i,
      base64Regex = /[^a-zA-Z0-9\/\+=]/i,
      numericDashRegex = /^[\d\-\s]+$/,
      urlRegex = /^((http|https):\/\/(\w+:{0,1}\w*@)?(\S+)|)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/,
      dateRegex = /\d{4}-\d{1,2}-\d{1,2}/,
      englishRegex = /^[a-zA-Z\s]+$/,
      passwordRegex = /^(?=.*[0-9])(?=.*[a-z|A-Z]).{8,}$/,
      wordsCountRegex = /\b\S+\b/g,
  // companyRegex = /(?:^|\s)(?:Corporation|Corp|Inc|Incorporated|Company|LTD|PLLC|P\.C)\.?$/ig
      companyRegex = /\bLTD\b/;


  /*
   * The exposed public object to validate a form:
   *
   * @param formNameOrNode - String - The name attribute of the form (i.e. <form name="myForm"></form>) or node of the form element
   * @param fields - Array - [{
   *     name: The name of the element (i.e. <input name="myField" />)
   *     display: 'Field Name'
   *     rules: required|matches[password_confirm],
   *     messages: {
   *        'rule_name': 'Custom message'
   *     }
   * }]
   *
   * @param options - Options
   */
  var FormValidator = function (formNameOrNode, fields, options) {
    this.o = {
      callbacks: {
        fields: [defaults.fieldCallback],
        form: [defaults.formCallback]
      }
    };

    // todo@alexbuturlakin: Remove jQuery usage
    jQuery.extend(this.o, options);

    this.errors = {};
    this.fields = {};
    this.form = this._formByNameOrNode(formNameOrNode) || {};
    this.messages = {};
    this.handlers = {};
    this.conditionals = {};

    for (var i = 0, fieldLength = fields.length; i < fieldLength; i++) {
      var field = fields[i];

      // If passed in incorrectly, we need to skip the field.
      if ((!field.name && !field.names) || !field.rules) {
        continue;
      }

      /*
       * Build the master fields array that has all the information needed to validate
       */
      if (field.names) {
        for (var j = 0, fieldNamesLength = field.names.length; j < fieldNamesLength; j++) {
          this._addField(field, field.names[j]);
        }
      } else {
        this._addField(field, field.name);
      }
    }
  };

  /**
   * Get element attribute.
   *
   * @param {HTMLInputElement} element
   * @param {String} attributeName
   *
   * @returns {String}
   */
  FormValidator.prototype.getAttributeValue = function (element, attributeName) {
    var i;

    if ((element.length > 0) && (element[0].type === 'radio' || element[0].type === 'checkbox')) {
      for (i = 0, elementLength = element.length; i < elementLength; i++) {
        if (element[i].checked) {
          return element[i][attributeName];
        }
      }

      return '';
    }

    return element[attributeName];
  };

  /*
   * @public
   * Sets a custom message for one of the rules
   */

  FormValidator.prototype.setMessage = function (rule, message) {
    this.messages[rule] = message;

    // return this for chaining
    return this;
  };

  /*
   * @public
   * Registers a callback for a custom rule (i.e. callback_username_check)
   */

  FormValidator.prototype.registerCallback = function (name, handler) {
    if (name && typeof name === 'string' && handler && typeof handler === 'function') {
      this.handlers[name] = handler;
    }

    // return this for chaining
    return this;
  };

  /*
   * @public
   * Registers a conditional for a custom 'depends' rule
   */

  FormValidator.prototype.registerConditional = function (name, conditional) {
    if (name && typeof name === 'string' && conditional && typeof conditional === 'function') {
      this.conditionals[name] = conditional;
    }

    // return this for chaining
    return this;
  };

  /*
   * @private
   * Determines if a form dom node was passed in or just a string representing the form name
   */

  FormValidator.prototype._formByNameOrNode = function (formNameOrNode) {
    return (typeof formNameOrNode === 'object') ? formNameOrNode : document.forms[formNameOrNode];
  };

  /*
   * @private
   * Adds a file to the master fields array
   */

  FormValidator.prototype._addField = function (field, nameValue) {
    this.fields[nameValue] = {
      name: nameValue,
      display: field.display || nameValue,
      rules: field.rules,
      depends: field.depends,
      id: null,
      element: null,
      type: null,
      value: null,
      checked: null
    };
  };

  /*
   * @private
   * Runs the validation when the form is submitted.
   */

  FormValidator.prototype._validateForm = function () {
    // clean errors
    this.cleanErrors();

    // validate form fields
    for (var key in this.fields) {
      this.validateField(key, 'form');
    }

    // execute callbacks
    this._executeCallbacks('form', [
      0 === Object.keys(this.errors).length,
      this.errors
    ], this.form);

    // result
    var result = 0 == Object.keys(this.errors).length;
    this.cleanErrors();

    return result;
  };

  /**
   * Execute callbacks.
   *
   * @param {String} type
   * @param {[]} params
   * @param {Object} [context]
   *
   * @returns {boolean}
   *
   * @private
   */
  FormValidator.prototype._executeCallbacks = function (type, params, context) {
    context = context || this;

    if (this.o.callbacks === typeof undefined || this.o.callbacks[type] === typeof undefined) {
      return false;
    }

    var callbacks = this.o.callbacks[type];

    for (var k in callbacks) {
      var callback = callbacks[k];
      callback.apply(context, params);
    }

    return true;
  };

  /**
   * @param {String} fieldName
   */
  FormValidator.prototype.validateField = function (fieldName, type) {
    type = type || 'single';
    if (this.fields.hasOwnProperty(fieldName)) {
      var field = this.fields[fieldName] || {},
          element = this.form[field.name];

      if (element && element !== undefined) {
        field.id      = this.getAttributeValue(element, 'id');
        field.element = element;
        field.type    = (element.length > 0) ? element[0].type : element.type;
        field.value   = this.getAttributeValue(element, 'value');
        field.checked = this.getAttributeValue(element, 'checked');

        /*
         * Run through the rules for each field.
         * If the field has a depends conditional, only validate the field
         * if it passes the custom function
         */
        if (field.depends && typeof field.depends === "function") {
          if (field.depends.call(this, field)) {
            this._validateField(field);
          }
        } else if (field.depends && typeof field.depends === "string" && this.conditionals[field.depends]) {
          if (this.conditionals[field.depends].call(this, field)) {
            this._validateField(field);
          }
        } else {
          this._validateField(field);
        }
      }

      this._executeCallbacks('fields', [
        !(fieldName in this.errors),
        type,
        field,
        fieldName in this.errors ? this.errors[fieldName] : []
      ], field.element);
    }
  };

  /*
   * @private
   * Looks at the fields value and evaluates it against the given rules
   */
  FormValidator.prototype._validateField = function (field) {
    var rules = field.rules.split('|'),
        indexOfRequired = field.rules.indexOf('required'),
        isEmpty = (!field.value || field.value === '' || field.value === undefined);

    /*
     * Run through the rules and execute the validation methods as needed
     */
    for (var i = 0, ruleLength = rules.length; i < ruleLength; i++) {
      var method = rules[i],
          param = null,
          failed = false,
          parts = ruleRegex.exec(method);

      /*
       * If this field is not required and the value is empty, continue on to the next rule unless it's a callback.
       * This ensures that a callback will always be called but other rules will be skipped.
       */
      if (indexOfRequired === -1 && method.indexOf('!callback_') === -1 && isEmpty) {
        continue;
      }

      /*
       * If the rule has a parameter (i.e. matches[param]) split it out
       */
      if (parts) {
        method = parts[1];
        param = this._getParams(parts);
      }

      if (method.charAt(0) === '!') {
        method = method.substring(1, method.length);
      }

      /*
       * If the hook is defined, run it to find any validation errors
       */
      if (typeof this._hooks[method] === 'function') {
        if (!this._hooks[method].apply(this, [field, param])) {
          failed = true;
        }
      } else if (method.substring(0, 9) === 'callback_') {
        // Custom method. Execute the handler if it was registered
        method = method.substring(9, method.length);

        if (typeof this.handlers[method] === 'function') {
          if (this.handlers[method].apply(this, [field.value, param, field]) === false) {
            failed = true;
          }
        }
      }

      /*
       * If the hook failed, add a message to the errors array
       */
      if (failed) {
        this._addError(field.name, {
          id: field.id,
          element: field.element,
          name: field.name,
          message: this._getMessage(field.name, method, param),
          rule: method
        });

        // Break out so as to not spam with validation errors (i.e. required and valid_email)
        // break;
      }
    }
  };

  /**
   * Add related error.
   *
   * @param {String} name
   * @param {{}} data
   *
   * @private
   */
  FormValidator.prototype._addError = function (name, data) {
    if (!(name in this.errors)) {
      this.errors[name] = [];
    }

    this.errors[name].push(data);
  };

  /**
   * private function _getValidDate: helper function to convert a string date to a Date object
   * @param date (String) must be in format yyyy-mm-dd or use keyword: today
   * @returns {Date} returns false if invalid
   */
  FormValidator.prototype._getValidDate = function (date) {
    if (!date.match('today') && !date.match(dateRegex)) {
      return false;
    }

    var validDate = new Date(),
        validDateArray;

    if (!date.match('today')) {
      validDateArray = date.split('-');
      validDate.setFullYear(validDateArray[0]);
      validDate.setMonth(validDateArray[1] - 1);
      validDate.setDate(validDateArray[2]);
    }
    return validDate;
  };

  /**
   * Get error message
   *
   * @param {String} fieldName
   * @param {String} method
   * @param {String} [param]
   *
   * @returns {string}
   */
  FormValidator.prototype._getMessage = function (fieldName, method, param) {

    var field   = this.fields[fieldName] || {},
        source  = this.messages[field + '.' + method] || this.messages[method] || defaults.messages[method],
        message = 'An error has occurred with the ' + field.display + ' field.',
        params  = param ? this.fields[param] ? this.fields[param].display : param : [];


    if (null === source) {
      return '';
    }

    if (source) {
      message = this.replace(source, field.display, params);
    }

    return message;
  };


  /**
   * Replace in message.
   *
   * @param {String|String[]} source
   * @param {String|String[]} display
   * @param {String|String[]} params
   */
  FormValidator.prototype.replace = function (source, display, params) {
    var replace = [];

    source = Array.isArray(source) ? source : [source];
    params = Array.isArray(params) ? params : [params];

    replace.push(display);
    replace = replace.concat(params);

    for(var s in source) {
      source[s] = FormValidator.prototype.formatString.apply(source[s], replace);
    }

    return 1 == source.length ? source[0] : source;
  };

  /**
   * Format string
   *
   * @returns {FormValidator}
   */
  FormValidator.prototype.formatString = function() {
    var s = this,
        i = arguments.length;

    while (i--) {
      s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }

    return s;
  };

  /**
   * Clean errors.
   */
  FormValidator.prototype.cleanErrors = function () {
    this.errors = {};
  };

  /**
   * Get rule info
   *
   * @param {String} rule
   * @returns {{}}
   */
  FormValidator.prototype._getRuleInfo = function (rule) {
    var parts = ruleRegex.exec(rule);

    if (parts) {
      return {
        'method': parts[1],
        'params': this._getParams(parts)
      };
    }

    return {
      'method': rule,
      'params': false
    };
  };

  /**
   * Get params for method.
   *
   * @param {Array|*} parts
   *
   * @returns {*}
   *
   * @private
   */
  FormValidator.prototype._getParams = function (parts) {
    if (false == parts) {
      return false;
    }

    var params = parts[2];

    if (false == params) {
      return false;
    }

    params = params.split(',');

    return 1 === params.length ? params[0] : params;
  };

  /*
   * @private
   * Object containing all of the validation hooks
   */

  FormValidator.prototype._hooks = {
    required: function (field) {
      var value = field.value;

      if ((field.type === 'checkbox') || (field.type === 'radio')) {
        return (field.checked === true);
      }

      return (value !== null && value !== '');
    },

    "default": function (field, defaultName) {
      return field.value !== defaultName;
    },

    matches: function (field, matchName) {
      var el = this.form[matchName];

      if (el) {
        return field.value === el.value;
      }

      return false;
    },

    valid_email: function (field) {
      return emailRegex.test(field.value);
    },

    english: function (field) {
      return englishRegex.test(field.value);
    },

    company_name: function (field) {
      return companyRegex.test(field.value);
    },

    valid_emails: function (field) {
      var result = field.value.split(/\s*,\s*/g);

      for (var i = 0, resultLength = result.length; i < resultLength; i++) {
        if (!emailRegex.test(result[i])) {
          return false;
        }
      }

      return true;
    },

    min_length: function (field, length) {
      if (!numericRegex.test(length)) {
        return false;
      }

      return (field.value.length >= parseInt(length, 10));
    },

    max_length: function (field, length) {
      if (!numericRegex.test(length)) {
        return false;
      }

      return (field.value.length <= parseInt(length, 10));
    },

    exact_length: function (field, length) {
      if (!numericRegex.test(length)) {
        return false;
      }

      return (field.value.length === parseInt(length, 10));
    },

    greater_than: function (field, param) {
      if (!decimalRegex.test(field.value)) {
        return false;
      }

      return (parseFloat(field.value) > parseFloat(param));
    },

    less_than: function (field, param) {
      if (!decimalRegex.test(field.value)) {
        return false;
      }

      return (parseFloat(field.value) < parseFloat(param));
    },

    length_one_or_two: function (field, params) {

      for (var k in params) {
        if (field.value.length === parseInt(params[k], 10)) {
          return true;
        }
      }

      return false;
    },

    alpha: function (field) {
      return (alphaRegex.test(field.value));
    },

    alpha_numeric: function (field) {
      return (alphaNumericRegex.test(field.value));
    },

    alpha_dash: function (field) {
      return (alphaDashRegex.test(field.value));
    },

    numeric: function (field) {
      return (numericRegex.test(field.value));
    },

    integer: function (field) {
      return (integerRegex.test(field.value));
    },

    decimal: function (field) {
      return (decimalRegex.test(field.value));
    },

    is_natural: function (field) {
      return (naturalRegex.test(field.value));
    },

    is_natural_no_zero: function (field) {
      return (naturalNoZeroRegex.test(field.value));
    },

    valid_ip: function (field) {
      return (ipRegex.test(field.value));
    },

    valid_base64: function (field) {
      return (base64Regex.test(field.value));
    },

    valid_url: function (field) {
      return (urlRegex.test(field.value));
    },

    password: function (field) {
      return (passwordRegex.test(field.value));
    },

    words_count: function (field, value) {
      var count = field.value.split(wordsCountRegex).length - 1;

      return count == value;
    },

    words_count_max: function (field, max) {
      var count = field.value.split(wordsCountRegex).length - 1;

      return count <= max;
    },

    words_count_min: function (field, min) {
      var count = field.value.split(wordsCountRegex).length - 1;

      return count >= min;
    },

    // todo@alexbuturlakin: remove one_word and two_words or add words_count validator
    one_word: function (field) {
      var count = field.value.split(wordsCountRegex).length;

      return 1 === count - 1 || 2 === count - 1;
    },

    two_words: function (field) {
      var count = field.value.split(wordsCountRegex).length;

      return 2 === count - 1;
    },

    valid_credit_card: function (field) {
      // Luhn Check Code from https://gist.github.com/4075533
      // accept only digits, dashes or spaces
      if (!numericDashRegex.test(field.value)) return false;

      // The Luhn Algorithm. It's so pretty.
      var nCheck = 0, nDigit = 0, bEven = false;
      var strippedField = field.value.replace(/\D/g, "");

      for (var n = strippedField.length - 1; n >= 0; n--) {
        var cDigit = strippedField.charAt(n);
        nDigit = parseInt(cDigit, 10);
        if (bEven) {
          if ((nDigit *= 2) > 9) nDigit -= 9;
        }

        nCheck += nDigit;
        bEven = !bEven;
      }

      return (nCheck % 10) === 0;
    },

    is_file_type: function (field, type) {
      if (field.type !== 'file') {
        return true;
      }

      var ext = field.value.substr((field.value.lastIndexOf('.') + 1)),
          typeArray = type.split(','),
          inArray = false,
          i = 0,
          len = typeArray.length;

      for (i; i < len; i++) {
        if (ext == typeArray[i]) inArray = true;
      }

      return inArray;
    },

    greater_than_date: function (field, date) {
      var enteredDate = this._getValidDate(field.value),
          validDate = this._getValidDate(date);

      if (!validDate || !enteredDate) {
        return false;
      }

      return enteredDate > validDate;
    },

    less_than_date: function (field, date) {
      var enteredDate = this._getValidDate(field.value),
          validDate = this._getValidDate(date);

      if (!validDate || !enteredDate) {
        return false;
      }

      return enteredDate < validDate;
    },

    greater_than_or_equal_date: function (field, date) {
      var enteredDate = this._getValidDate(field.value),
          validDate = this._getValidDate(date);

      if (!validDate || !enteredDate) {
        return false;
      }

      return enteredDate >= validDate;
    },

    less_than_or_equal_date: function (field, date) {
      var enteredDate = this._getValidDate(field.value),
          validDate = this._getValidDate(date);

      if (!validDate || !enteredDate) {
        return false;
      }

      return enteredDate <= validDate;
    }
  };

  window.FormValidator = FormValidator;

  // jQuery integration
  (function ($) {
    /**
     * Get or set messages for validation errors.
     *
     * @param {{}} [messages]
     */
    $.validatorMessages = function (messages) {
      messages = messages || {};

      return $.extend(defaults.messages, messages);
    }

  })(jQuery);

})(window, document);

/*
 * Export as a CommonJS module
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FormValidator;
}