module('OData');
test("Clone tests", function () {
    var odata,
        uri,
        actual,
        input,
        expected;

    // both new and current are absolute uris
    input = expected = oData('http://services.odata.org/OData/OData.svc');
    actual = input.clone();
    same(actual, expected);

});