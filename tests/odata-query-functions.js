module('OData');

test("create odata object", function () {
    var input, expected, actual, odata;

    odata = oData("http://services.odata.org/OData/OData.svc/");
    equals(odata.uri.stringify(), "http://services.odata.org/OData/OData.svc");

    odata = oData("http://services.odata.org/OData/OData.svc");
    equals(odata.uri.stringify(), "http://services.odata.org/OData/OData.svc");

    // test creation with 
    expected = input = {
        root: 'http://services.odata.org/OData/OData.svc',
        resource: 'Categories(1)',
        links: 'Products'
    };
    actual = oData(input);
    same(actual.uri.segments, expected);

    // test construction with dataType=jsonp
    input = {
        root: 'http://services.odata.org/OData/OData.svc',
        resource: 'Products'
    };
    expected = {
        root: 'http://services.odata.org/OData/OData.svc',
        resource: 'Products',
        options: { format: "json", callback: "resultCallback" }
    };
    actual = oData(input, { dataType: 'jsonp' });
    same(actual.uri.segments, expected);
});

test("Addressing Entries", function () {
    var input, expected, actual, odata;
    odata = oData("http://services.odata.org/OData/OData.svc");

    actual = odata.clone().from("Categories(1)");
    expected = {
        root: 'http://services.odata.org/OData/OData.svc',
        resource: 'Categories(1)'
    };
    same(actual.uri.segments, expected);

    actual = odata.clone().from("Categories(1)/Name");
    expected = {
        root: 'http://services.odata.org/OData/OData.svc',
        resource: 'Categories(1)/Name'
    };
    same(actual.uri.segments, expected);

    actual = odata.clone().from("/Categories(1)/Name/");
    expected = {
        root: 'http://services.odata.org/OData/OData.svc',
        resource: 'Categories(1)/Name'
    };
    same(actual.uri.segments, expected);

    actual = odata.clone().from('Categories(1)/Products/').count(false);
    expected = {
        root: 'http://services.odata.org/OData/OData.svc',
        resource: 'Categories(1)/Products',
        count: true
    };
    same(actual.uri.segments, expected);

    actual = odata.clone().from('Categories(1)/Products(1)/Supplier/Address/City').value(false);
    expected = {
        root: 'http://services.odata.org/OData/OData.svc',
        resource: 'Categories(1)/Products(1)/Supplier/Address/City',
        value: true
    };
    same(actual.uri.segments, expected);
});

test("Addressing Links between Entries", function () {
    var input, expected, actual, odata;
    odata = oData("http://services.odata.org/OData/OData.svc");

    actual = odata.clone().from("Categories(1)").links("Products");
    expected = {
        root: 'http://services.odata.org/OData/OData.svc',
        resource: 'Categories(1)',
        links: 'Products'
    };
    same(actual.uri.segments, expected);

    actual = odata.clone().from("Products(1)").links("Category");
    expected = {
        root: 'http://services.odata.org/OData/OData.svc',
        resource: 'Products(1)',
        links: 'Category'
    };
    same(actual.uri.segments, expected);
});

test("Addressing Service Operations", function () {
    var input, expected, actual, odata;
    odata = oData("http://services.odata.org/OData/OData.svc");

    actual = odata.clone().from("ProductColors");
    expected = {
        root: 'http://services.odata.org/OData/OData.svc',
        resource: 'ProductColors'
    };
    same(actual.uri.segments, expected);



    actual = odata.clone().from("ProductsByColor").params({ color: "'red'" });
    expected = {
        root: 'http://services.odata.org/OData/OData.svc',
        resource: 'ProductsByColor',
        options: {
            params: {
                color: "'red'"
            }
        }
    };
    same(actual.uri.segments, expected);

    actual = odata.clone().from("ProductsByColor(3)/Category/Name").params({ color: "'red'" });
    expected = {
        root: 'http://services.odata.org/OData/OData.svc',
        resource: 'ProductsByColor(3)/Category/Name',
        options: {
            params: {
                color: "'red'"
            }
        }
    };
    same(actual.uri.segments, expected);

    actual = odata.clone().from("ProductsByColor").params({ color: "'red'", param: 'foo' });
    expected = {
        root: 'http://services.odata.org/OData/OData.svc',
        resource: 'ProductsByColor',
        options: {
            params: {
                color: "'red'",
                param: 'foo'
            }
        }
    };
    same(actual.uri.segments, expected);

    odata = oData("http://localhost:32751/services/AdventureWorks.svc");
    actual = odata.clone().from("GetProductsByColor(706)/ProductNumber/").params({ color: "'red'" }).value(false);
    expected = {
        root: 'http://localhost:32751/services/AdventureWorks.svc',
        resource: 'GetProductsByColor(706)/ProductNumber',
        value: true,
        options: {
            params: {
                color: "'red'"
            }
        }
    };
    same(actual.uri.segments, expected);

    actual = odata.clone().from("GetProductsByColor").params({ color: "'red'" }).orderby("Name");
    expected = {
        root: 'http://localhost:32751/services/AdventureWorks.svc',
        resource: 'GetProductsByColor',
        options: {
            orderby: 'Name',
            params: {
                color: "'red'"
            }
        }
    };
    same(actual.uri.segments, expected);

});

test("Query String Options", function () {
    var input, expected, actual, odata;

    odata = oData("http://services.odata.org/OData/OData.svc");
    actual = odata.clone().from("Products").orderby("Rating");
    expected = {
        root: 'http://services.odata.org/OData/OData.svc',
        resource: 'Products',
        options: {
            orderby: 'Rating'
        }
    };
    same(actual.uri.segments, expected);

    actual = odata.clone().from("Products").orderby("Rating asc");
    expected = {
        root: 'http://services.odata.org/OData/OData.svc',
        resource: 'Products',
        options: {
            orderby: 'Rating asc'
        }
    };
    same(actual.uri.segments, expected);

    actual = odata.clone().from("Products").orderby("Rating,Category/Name desc");
    expected = {
        root: 'http://services.odata.org/OData/OData.svc',
        resource: 'Products',
        options: {
            orderby: 'Rating,Category/Name desc'
        }
    };
    same(actual.uri.segments, expected);

    actual = odata.clone().from("Products").top(5);
    expected = {
        root: 'http://services.odata.org/OData/OData.svc',
        resource: 'Products',
        options: {
            top: 5
        }
    };
    same(actual.uri.segments, expected);

    actual = odata.clone().from("Products").top(5).orderby("Name desc");
    expected = {
        root: 'http://services.odata.org/OData/OData.svc',
        resource: 'Products',
        options: {
            top: 5,
            orderby: 'Name desc'
        }
    };
    same(actual.uri.segments, expected);

    actual = odata.clone().from("Categories(1)/Products").skip(2);
    expected = {
        root: 'http://services.odata.org/OData/OData.svc',
        resource: 'Categories(1)/Products',
        options: {
            skip: 2
        }
    };
    same(actual.uri.segments, expected);

    actual = odata.clone().from("Products").skip(2).top(2).orderby("Rating");
    expected = {
        root: 'http://services.odata.org/OData/OData.svc',
        resource: 'Products',
        options: {
            top: 2,
            skip: 2,
            orderby: 'Rating'
        }
    };
    same(actual.uri.segments, expected);

    actual = odata.clone().from("Suppliers").filter("Address/City eq 'Redmond'");
    expected = {
        root: 'http://services.odata.org/OData/OData.svc',
        resource: 'Suppliers',
        options: {
            filter: "Address/City eq 'Redmond'"
        }
    };
    same(actual.uri.segments, expected);

    actual = odata.clone().from("Categories").expand("Products");
    expected = {
        root: 'http://services.odata.org/OData/OData.svc',
        resource: 'Categories',
        options: {
            expand: 'Products'
        }
    };
    same(actual.uri.segments, expected);

    actual = odata.clone().from("Categories").expand("Products/Suppliers");
    expected = {
        root: 'http://services.odata.org/OData/OData.svc',
        resource: 'Categories',
        options: {
            expand: 'Products/Suppliers'
        }
    };
    same(actual.uri.segments, expected);

    actual = odata.clone().from("Categories").expand("/Products/Suppliers/");
    expected = {
        root: 'http://services.odata.org/OData/OData.svc',
        resource: 'Categories',
        options: {
            expand: 'Products/Suppliers'
        }
    };
    same(actual.uri.segments, expected);

    actual = odata.clone().from("Products").expand("Category,Suppliers");
    expected = {
        root: 'http://services.odata.org/OData/OData.svc',
        resource: 'Products',
        options: {
            expand: 'Category,Suppliers'
        }
    };
    same(actual.uri.segments, expected);

    actual = odata.clone().from("Products").select("Price,Name");
    expected = {
        root: 'http://services.odata.org/OData/OData.svc',
        resource: 'Products',
        options: {
            select: 'Price,Name'
        }
    };
    same(actual.uri.segments, expected);

    actual = odata.clone().from("Products").select("Name,Category");
    expected = {
        root: 'http://services.odata.org/OData/OData.svc',
        resource: 'Products',
        options: {
            select: 'Name,Category'
        }
    };
    same(actual.uri.segments, expected);

    actual = odata.clone().from("Categories").select("Name,Products").expand("Products/Suppliers");
    expected = {
        root: 'http://services.odata.org/OData/OData.svc',
        resource: 'Categories',
        options: {
            expand: 'Products/Suppliers',
            select: 'Name,Products'
        }
    };
    same(actual.uri.segments, expected);

    actual = odata.clone().from("Products").select("*");
    expected = {
        root: 'http://services.odata.org/OData/OData.svc',
        resource: 'Products'
    };
    same(actual.uri.segments, expected);

    actual = odata.clone().from("Products").inlinecount();
    expected = {
        root: 'http://services.odata.org/OData/OData.svc',
        resource: 'Products',
        options: {
            inlinecount: true
        }
    };
    same(actual.uri.segments, expected);

    actual = odata.clone().from("Products").inlinecount("allpages");
    expected = {
        root: 'http://services.odata.org/OData/OData.svc',
        resource: 'Products',
        options: {
            inlinecount: true
        }
    };
    same(actual.uri.segments, expected);

    actual = odata.clone().from("Products").inlinecount(false);
    expected = {
        root: 'http://services.odata.org/OData/OData.svc',
        resource: 'Products'
    };
    same(actual.uri.segments, expected);

    actual = odata.clone().from("Products").inlinecount('none');
    expected = {
        root: 'http://services.odata.org/OData/OData.svc',
        resource: 'Products'
    };
    same(actual.uri.segments, expected);

    actual = odata.clone().from("Products").inlinecount().top(10).filter("Price gt 200");
    expected = {
        root: 'http://services.odata.org/OData/OData.svc',
        resource: 'Products',
        options: {
            inlinecount: true,
            top: 10,
            filter: "Price gt 200"
        }
    };
    same(actual.uri.segments, expected);

});