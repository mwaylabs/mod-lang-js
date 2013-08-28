/*
 * Copyright 2011-2012 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

if (typeof __vertxload === 'string') {
  throw "Use require() to load Vert.x API modules"
}

// handler wrapper
load("vertx/helpers.js");

// TODO: WRAP JAVA LISTS IN ASYNC RESULT HANDLERS

/**
 * @exports vertx/dns
 */
var dns = {
  /**
   * Creates and returns a DNS client object
   *
   * @param {Array|string} [servers] The DNS server address(es). If not supplied, defaults
   *        to Google DNS servers 8.8.8.8 and 8.8.4.4
   *        TODO: Figure out proper default behavior
   * @returns {DnsClient} A DnsClient object 
   */
  createDnsClient: function(servers) {
    if (typeof servers == 'undefined') {
      servers = '8.8.8.8';
    }
    return new DnsClient(servers);
  },
};

var DnsClient = function(servers) {
  var that = this;

  var wrapIpAddresses = function(addresses) {
    if (typeof addresses === 'string') {
      return [new java.net.InetSocketAddress(java.net.InetAddress.getByName(addresses), 53)];
    } else {
      // TODO: Be smarter about what's passed in
      return [addresses];
    }
  }

  var hostAddressConverter = function(address) { return address.getHostAddress() }

  var mappedHostAddressConverter = function(addresses) {
    var addrs = [];
    for (var i = 0; i < addresses.size(); i++) {
      addrs[i] = addresses.get(i).getHostAddress();
    }
    return addrs;
  }

  /** 
   * @typedef {{}} MxRecord 
   * @property {number} priority The record priority
   * @property {string} name The record name
   * */
  var mappedMxConverter = function(records) {
    var recs = [];
    for (var i = 0; i < records.size(); i++) {
      recs[i] = {
        priority: records.get(i).priority(),
        name: records.get(i).name()
      }
    }
    return recs;
  }

  /** 
   * @typedef {{}} SrvRecord 
   * @property {number} priority The record priority
   * @property {number} weight The record weight
   * @property {number} port The record port
   * @property {string} name The record name
   * @property {string} protocol The record protocol
   * @property {string} service The record service
   * @property {string} target The record target
   * */
  var mappedSrvConverter = function(records) {
    var recs = [];
    for (var i = 0; i < records.size(); i++) {
      var record = records.get(i);
      recs[i] = {
        priority: record.priority(),
        weight: record.weight(),
        port: record.port(),
        name: record.name(),
        protocol: record.protocol(),
        service: record.service(),
        target: record.target()
      }
    }
    return recs;
  }

  this.lookup = function(name, handler) {
    __jClient.lookup(name, adaptAsyncResultHandler(handler, hostAddressConverter));
    return that;
  }

  this.lookup4 = function(name, handler) {
    __jClient.lookup4(name, adaptAsyncResultHandler(handler, hostAddressConverter));
    return that;
  }

  this.lookup6 = function(name, handler) {
    __jClient.lookup6(name, adaptAsyncResultHandler(handler, hostAddressConverter));
    return that;
  }

  this.resolveNS = function(name, handler) {
    __jClient.resolveNS(name, adaptAsyncResultHandler(handler));
    return that;
  }

  this.resolveTXT = function(name, handler) {
    __jClient.resolveTXT(name, adaptAsyncResultHandler(handler));
    return that;
  }

  this.resolveMX = function(name, handler) {
    __jClient.resolveMX(name, adaptAsyncResultHandler(handler, mappedMxConverter));
    return that;
  }

  this.resolveA = function(name, handler) {
    __jClient.resolveA(name, adaptAsyncResultHandler(handler, mappedHostAddressConverter));
    return that;
  }

  this.resolveAAAA = function(name, handler) {
    __jClient.resolveAAAA(name, adaptAsyncResultHandler(handler, mappedHostAddressConverter));
    return that;
  }

  this.resolveCNAME = function(name, handler) {
    __jClient.resolveCNAME(name, adaptAsyncResultHandler(handler));
    return that;
  }

  this.resolvePTR = function(name, handler) {
    __jClient.resolvePTR(name, adaptAsyncResultHandler(handler));
    return that;
  }

  this.resolveSRV = function(name, handler) {
    __jClient.resolveSRV(name, adaptAsyncResultHandler(handler, mappedSrvConverter));
    return that;
  }

  this.reverseLookup = function(name, handler) {
    __jClient.reverseLookup(name, adaptAsyncResultHandler(handler));
    return that;
  }

  var __jClient = __jvertx.createDnsClient(wrapIpAddresses(servers));
}

module.exports = dns;
