Ext.define('Admin.view.security.secBaseController.setAndArrayController', {
    extend: 'Ext.app.ViewController',

    toArray: function (set) {
        var arr = [];
        if (set != null) {
            set.forEach(function (element, sameElement, set) {
                arr.push(element);
            });
        }
        return arr;
    },

    getSubnetArray: function (type) {
        var subnetSet = this.getSubnetSet(type),
            subnetArr = this.toArray(subnetSet);
        return subnetArr;
    },

    getSubnetDevArray: function (type) {
        var subnetDevSet = this.getSubnetDevSet(type),
            subnetDevArr = this.toArray(subnetDevSet);
        return subnetDevArr;
    },

    getSymbolArray: function (type) {
        var symbolSet = this.getSymbolSet(type),
            symbolArr = this.toArray(symbolSet);
        return symbolArr;
    },

    getDelSubnetArray: function (type) {
        var delSubnetSet = this.getDelSubnetSet(type),
            delSubnetArr = this.toArray(delSubnetSet);
        return delSubnetArr;
    },

    getDelSymbolArray: function (type) {
        delSymbolSet = this.getDelSymbolSet(type),
            delSymbolArr = this.toArray(delSymbolSet);
        return delSymbolArr;
    },

    getSubnetSet: function (type) {
        return this.getView().up("secUserLeftTree").down(type).subnetSet;
    },

    getSubnetDevSet: function (type) {
        return this.getView().up("secUserLeftTree").down(type).subnetDevSet;
    },

    getSymbolSet: function (type) {
        return this.getView().up("secUserLeftTree").down(type).symbolSet;
    },

    getDelSubnetSet: function (type) {
        return this.getView().up("secUserLeftTree").down(type).delSubnetSet;
    },

    getDelSymbolSet: function (type) {
        return this.getView().up("secUserLeftTree").down(type).delSymbolSet;
    }
});