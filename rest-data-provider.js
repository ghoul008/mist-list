import '@polymer/polymer/polymer-legacy.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';

Polymer({
  is: 'rest-data-provider',

  properties: {
    loading: {
      type: Boolean,
      notify: true,
      value: false,
    },

    delay: {
      type: Number,
      value: 100,
    },

    count: {
      type: Number,
      value: 0,
      notify: true,
    },

    received: {
      type: Number,
      value: 0,
      notify: true,
    },

    url: {
      type: String,
    },

    colmap: {
      type: Object,
      value() {
        return {};
      },
    },

    columns: {
      type: Array,
      notify: true,
    },

    frozen: {
      type: Array,
      value() {
        return [];
      },
    },

    itemMap: {
      type: Object,
      value() {
        return {};
      },
      notify: true,
    },

    primaryFieldName: {
      type: String,
      value: 'id',
    },

    timeseries: {
      type: Boolean,
      value: false,
    },

    stop: {
      type: Number,
      value: 0,
    },

    filter: {
      type: String,
    },

    provider: {
      notify: true,
    },

    finished: {
      type: Boolean,
      value: false,
      notify: true,
    },
  },

  observers: ['_computeDataProvider(filter, url)'],

  _computeDataProvider() {
    if (this.url && this.url.length)
      // eslint-disable-next-line func-names
      this.debounce(
        '_computeDataProvider',
        function() {
          this.stop = 0;
          this.count = 0;
          this.received = 0;
          this.finished = false;
          const _this = this;
          this.set('provider', (opts, callback) => {
            if (_this.finished) return;
            if (!opts.page) {
              _this.count = 0;
              _this.received = 0;
            }
            const xhr = new XMLHttpRequest();
            let url = `${_this.url}?`;
            url += `limit=${opts.pageSize}&`;
            if (!_this.timeseries) {
              url += `start=${opts.page * opts.pageSize}&`;
            } else if (_this.stop) {
              url += `stop=${Math.floor(_this.stop)}&`;
            }
            if (_this.filter) {
              url += `filter=${encodeURIComponent(_this.filter)}`;
              // console.log('filter', _this.filter);
            }
            if (opts.sortOrders && opts.sortOrders.length)
              url += `order=${encodeURIComponent(
                opts.sortOrders.map(b => (b.direction === 'desc' ? '-' : '') + b.path),
              )}`;
            if (opts.page === 0) _this.set('received', 0);
            xhr.open('GET', url);

            // eslint-disable-next-line func-names
            xhr.onreadystatechange = function() {
              if (xhr.readyState === 4 && xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                let items;
                if (!_this.timeseries) {
                  _this.count = response.count;
                  items = response.items;
                } else {
                  items = response;
                  _this.count += items.length;
                  if (items.length < opts.pageSize) _this.set('finished', true);
                }
                _this.received += items.length;
                if (items && items.length) {
                  // update column map using response.items values
                  items.forEach(i => {
                    _this.itemMap[i[_this.primaryFieldName]] = i;
                    Object.keys(i).forEach(k => {
                      _this.colmap[k] = true;
                    });
                  });
                  _this.set('received', Object.keys(_this.itemMap).length);
                  // Compute columns list from colmap, removing frozen columns
                  const cols = Object.keys(_this.colmap);
                  _this.frozen.forEach(f => {
                    if (cols.indexOf(f) > -1) cols.splice(cols.indexOf(f), 1);
                  });
                  _this.set('columns', cols);
                  if (_this.timeseries && items.length === opts.pageSize) {
                    _this.set('stop', items[items.length - 1][_this.primaryFieldName]);
                    // console.log('setting stop to', items[items.length -1][_this.primaryFieldName])
                  } else if (_this.timeseries && items.length < opts.pageSize) {
                    _this.count = _this.received;
                  }
                }
                callback(items, _this.count);
                if (_this.parentElement) {
                  // eslint-disable-next-line func-names
                  _this.parentElement.async(function() {
                    this.fire('resize');
                  }, 1000);
                }
              }
              _this.loading = false;
            };

            xhr.send();
            _this.loading = true;
          });
        },
        500,
      );
  },
});