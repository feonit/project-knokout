define(['knockout', 'ajaxAdapter', 'knockoutConfig'], function(ko, ajaxAdapter){

	/**
	 * @class {Collection}
	 *
	 * */
	function Collection(options){

		if (!options) {
			options = {};
		}

		// default params
		this.id = typeof options.id !== 'undefined' ? parseInt(options.id, 10) : undefined;
		this.url = '';                                                                              // string of function
		this.model = null;                                                                          // model of collection as prototype
		this.models = ko.observableArray([]);                                                       // optional
		this.loaded = ko.observable(false);                                                         // flag when any data was load (all data or part of them)
		this.uploaded = ko.observable(false);                                                       // flag when part data was upload (all data or part of them)
		this.loading = ko.observable(false);                                                        // flag when all data in process for load
		this.uploading = ko.observable(false);                                                      // flag when part data in process for load (lazy)
		this.isAccessDenied = ko.observable(false);                                                 // flag
		this.total = ko.observable();
		this.member = ko.observable(); // это костыль, используется в коллекции сообщений для диалогов, нет возможности установки доп параметров локальной для своей коллекции
		this.initSearch = ko.observable(false);

		// for all collection by default
		this.portion = (function(){

			var MIN_COUNT = 3;                                                                      // максимальное количество доступных взору элементов списка
			var MULTIPLICITY = 2;                                                                   // кратность

			var portion = Math.ceil( (Math.abs( window.innerHeight - 400 ) / 80) * MULTIPLICITY );  // default value for lazy loading 80 - one cell 400 - height top

			if (portion < MIN_COUNT){
				portion = MIN_COUNT;
			}

			return portion;
		})();

		var protoProps = arguments[arguments.length - 1];

		Collection.prototype.provideProperties.call(this, protoProps);                                        // add protoProps params

		// mix view if exist
		if (protoProps.view){
			var options = arguments[0] || {};
			options.collection = this;
			this.mixView(new protoProps.view(options));                                 // link to collection
		}
	}

	/**
	 * @public {Function}   Method for create new instance of Collection
	 *                      with the general behavior
	 * */
	Collection.extend = function(protoProps){

		if (typeof protoProps.url !== "string" && typeof protoProps.url !== "function"){
			throw "the [url] must be a string or function"
		}

		if (typeof protoProps.model !== "function"){
			throw "the [model] must be a function"
		}

		if (protoProps.adapterAnswerData && typeof protoProps.adapterAnswerData !== "function"){    //optional
			throw "the [adapterAnswerData] must be a function"
		}

		if (protoProps.parse && typeof protoProps.parse !== "function"){                            //optional
			throw "the [parse] must be a function"
		}

		if (protoProps.initialize && typeof protoProps.initialize !== "function"){//optional
			throw "the [initialize] must be a function"
		}

		if (protoProps.getAdditionalReversParam && typeof protoProps.getAdditionalReversParam !== "function"){//optional
			throw "the [getAdditionalReversParam] must be a function"
		}

		var parent = Collection;

		function child(){
			parent.apply(this, (Array.prototype.slice.apply(arguments)).concat(protoProps));     // add Collection params
		}

		child.prototype = Object.create(Collection.prototype);                                      // add prototype Collection methods

		return child;
	};

	/**
	 * @prototype
	 *
	 * */
	Collection.prototype = {
		constructor: Collection,

		fetch: function (options){
			if (this.loading()) return false;

			var that = this,
				lazyUrl, test, url, searchString, callback, isLazyProcess, setGETParameters;

			if (options){
				searchString = options.searchString;    // for upload data with params
				lazyUrl = options.lazyUrl;              // for lazy upload data
				callback = options.callback;
				isLazyProcess = options.lazyUrl && !!options.lazyUrl;
				setGETParameters = options.setGETParameters;
			}

			if ( this.loaded() && isLazyProcess ){
				this.uploaded(false);
				this.uploading(true);
			} else {
				this.loading(true);
			}

			//that.loaded(false);

			if (searchString){
				url = typeof this.urlSearch === 'function' ? this.urlSearch.call(this) : this.urlSearch;
			} else {
				url = ( lazyUrl || (typeof this.url === 'function' ? this.url.call(this) : this.url) );

				if (this.getAdditionalReversParam){
					url = url + this.getAdditionalReversParam();
				}

				if (setGETParameters){
					var existParams = /\?/.test(url);

					if (!existParams){
						url = url + '?_=0';
					}
					for (var key in setGETParameters){
						url = url + '&' + key + '=' + setGETParameters[key];
					}
				}
			}

			if (searchString){
				this.initSearch(true);
				ajaxAdapter.request(url, 'post', {'q': searchString}, function(res){
					that._precessStatusOfResponseHandler.call(that, res, function(){
						that._precessResultHandler.call(that, res.result, options);
					});
				});
			} else {
				this.initSearch(false);
				var xhr = ajaxAdapter.getRequestRestApi(url, function(res){
					that._precessStatusOfResponseHandler.call(that, res, function(){
						that._precessResultHandler.call(that, res.result, options);
					});
				});
			}

			return xhr;
		},

		_stopProcesses: function(){
			this.uploading(false);
			this.loading(false);
			this.loaded(true);
			this.uploaded(false);
		},

		_precessStatusOfResponseHandler: function(res, callback){
			if (res.status == 'success') {
				return callback();
			} else if (res.status == 'forbidden'){
				this._stopProcesses.call(this);
				return this.isAccessDenied(true);
			} else {
				throw new Error('Status of response from server is not defined');
			}
		},

		_precessResultHandler: function ( result ){

			var data = result.data;

			if (this.adapterAnswerData){
				data = this.adapterAnswerData.call(this, result)
			}

			var items = [],
				options = arguments[arguments.length -1], // last param
				callback, isLazyProcess;

			if (options){
				callback = options.callback;
				isLazyProcess = options.lazyUrl && !!options.lazyUrl;
			}

			var that = this;

			data.forEach(function(params){
				var model = new that.model;

				that.parse && that.parse(params);
				ko.mapping.fromJS(params, {}, model);
				items.push(model);
			});

			this.initialize && this.initialize(items, data);

			if (isLazyProcess && this.models().length !== 0){
				if (this.getAdditionalReversParam){
					this.models.unshiftAll(items)
				} else {
					this.models.pushAll(items)
				}
			} else {
				this.models.destroy(); //МЕГА КОСТЫЛЬ
				this.models(items);
			}

			callback && callback();

			if ( this.loaded() && isLazyProcess ){
				this.uploading(false);
				this.uploaded(true);
			} else {
				this.loading(false);
			}

			if (!this.loaded()){    // only one first moment
				this.loaded(true)
			}
		},

		lazyFetch: function (options){
			var callback, portion;

			// exit if not end prev processes
			if (this.uploading() || this.loading() ){
				return;
			}
			// exit if there nothing to download
			if (this.total && (this.total() <= this.models().length)){
				if (this.total() !== 0){
					return;
				}
			}

			if (options){
				callback = options.callback;
				portion = options.portion;
			}

			var limit = portion || this.portion;
			var offset = this.models().length;

			var url = (typeof this.url === 'function' ? this.url.call(this) : this.url);
			var lazyUrl = url + '?offset=' + offset + '&limit=' + limit;

			this.fetch({
				lazyUrl: lazyUrl,
				callback: callback
			});

		},

		add: function (){
			// todo add model or array of models in collection (from eventSource)
		},

		removeAllModels: function(){
			this.models([]);
		},

		updateLazyFetch: function(options){
			this.loaded(false);
			this.removeAllModels();
			this.lazyFetch(options);
		},

		provideProperties: function (properties){
			if (properties){
				for ( var propName in properties){
					if (properties.hasOwnProperty(propName)){
						this[propName] = properties[propName]
					}
				}
			}
			return this;
		},

		mixView : function(properties){
			if (properties){
				for ( var propName in properties){
					if (properties.hasOwnProperty(propName)){
						this[propName] = properties[propName];
					} else {
						this[propName] = properties[propName];//todo кудато в другое место луче
					}
				}
			}
		},

		where: function(hash){
			var suitable, rezult;

			rezult = ko.utils.arrayFilter(this.models(), function(model){
				suitable = false;

				window.Object.keys(hash).forEach(function(key){
					if (model[key]() && model[key]() === hash[key])
						suitable = true;
				});

				return suitable;
			});

			console.log(hash, rezult);

			return rezult;
		}
	};

	return Collection;
});