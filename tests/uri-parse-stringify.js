module('Uri');
test("Parse tests", function () {
    var odata,
        uri,
        actual,
        input,
        expected;

    // both new and current are absolute uris
    odata = oData('http://services.odata.org/OData/OData.svc');
    input = 'http://services.odata.org/OData/OData.svc/Category(1)/Products/';
    expected = {
        root: 'http://services.odata.org/OData/OData.svc',
        resource: 'Category(1)/Products'
    };
    actual = odata.uri.parse(input);
    same(actual.segments, expected);


    // both new and current are relative uris
    odata = oData('/OData/OData.svc');
    input = '/OData/OData.svc/Category(1)/Products';
    expected = {
        root: '/OData/OData.svc',
        resource: 'Category(1)/Products'
    };
    actual = odata.uri.parse(input);
    same(actual.segments, expected);

    // new is relative, current is absolute uris
    odata = oData('http://services.odata.org/OData/OData.svc');
    input = '/OData/OData.svc/Category(1)/Products';
    expected = {
        root: 'http://services.odata.org/OData/OData.svc',
        resource: 'Category(1)/Products'
    };
    actual = odata.uri.parse(input);
    same(actual.segments, expected);

    // new is absolute, current is relative
    odata = oData('/OData/OData.svc');
    input = 'http://services.odata.org/OData/OData.svc/Category(1)/Products/';
    expected = {
        root: '/OData/OData.svc',
        resource: 'Category(1)/Products'
    };
    actual = odata.uri.parse(input);
    same(actual.segments, expected);

    // from here on we just use a relative root url
    odata = oData('/OData/OData.svc');

    // detect $count                
    input = "/OData/OData.svc/Category(1)/Products/$count";
    expected = {
        root: '/OData/OData.svc',
        resource: 'Category(1)/Products',
        count: true
    };
    actual = odata.uri.parse(input);
    same(actual.segments, expected);

    // detect $value
    input = "/OData/OData.svc/Categories(1)/Products(1)/Supplier/Address/City/$value";
    expected = {
        root: '/OData/OData.svc',
        resource: 'Categories(1)/Products(1)/Supplier/Address/City',
        value: true
    };
    actual = odata.uri.parse(input);
    same(actual.segments, expected);

    // detect $links
    input = "/OData/OData.svc/Categories(1)/$links/Products";
    expected = {
        root: '/OData/OData.svc',
        resource: 'Categories(1)',
        links: 'Products'
    };
    actual = odata.uri.parse(input);
    same(actual.segments, expected);

    // detect $orderby
    input = "/OData/OData.svc/Products?$orderby=Name,ReleaseDate desc";
    expected = {
        root: '/OData/OData.svc',
        resource: 'Products',
        options: {
            orderby: 'Name,ReleaseDate desc'
        }
    };
    actual = odata.uri.parse(input);
    same(actual.segments, expected);

    // detect $orderby, $skip
    input = "/OData/OData.svc/Products?$orderby=Name,ReleaseDate desc&$skip=50";
    expected = {
        root: '/OData/OData.svc',
        resource: 'Products',
        options: {
            orderby: 'Name,ReleaseDate desc',
            skip: 50
        }
    };
    actual = odata.uri.parse(input);
    same(actual.segments, expected);

    // detect $orderby, $top
    input = "/OData/OData.svc/Products?$orderby=Name,ReleaseDate desc&$skip=50&$top=20";
    expected = {
        root: '/OData/OData.svc',
        resource: 'Products',
        options: {
            orderby: 'Name,ReleaseDate desc',
            skip: 50,
            top: 20
        }
    };
    actual = odata.uri.parse(input);
    same(actual.segments, expected);

    // detect $orderby, $skip, $top, $filter
    input = "/OData/OData.svc/Products?$filter=not endswith(Description,'milk')&$orderby=Name,ReleaseDate desc&$skip=50&$top=20";
    expected = {
        root: '/OData/OData.svc',
        resource: 'Products',
        options: {
            orderby: 'Name,ReleaseDate desc',
            skip: 50,
            top: 20,
            filter: "not endswith(Description,'milk')"
        }
    };
    actual = odata.uri.parse(input);
    same(actual.segments, expected);

    // detect $orderby, $skip, $top, $filter, $expand
    input = "/OData/OData.svc/Products?$expand=Category&$filter=not endswith(Description,'milk')&$orderby=Name,ReleaseDate desc&$skip=50&$top=20";
    expected = {
        root: '/OData/OData.svc',
        resource: 'Products',
        options: {
            orderby: 'Name,ReleaseDate desc',
            skip: 50,
            top: 20,
            filter: "not endswith(Description,'milk')",
            expand: 'Category'
        }
    };
    actual = odata.uri.parse(input);
    same(actual.segments, expected);

    // detect $select
    input = "/OData/OData.svc/Products?$select=Name,Description";
    expected = {
        root: '/OData/OData.svc',
        resource: 'Products',
        options: {
            select: 'Name,Description'
        }
    };
    actual = odata.uri.parse(input);
    same(actual.segments, expected);

    // detect $inlinecount
    input = "/OData/OData.svc/Products?$inlinecount=allpages";
    expected = {
        root: '/OData/OData.svc',
        resource: 'Products',
        options: {
            inlinecount: true
        }
    };
    actual = odata.uri.parse(input);
    same(actual.segments, expected);

    // detect $format
    input = "/OData/OData.svc/Products?$format=text";
    expected = {
        root: '/OData/OData.svc',
        resource: 'Products',
        options: {
            format: 'text'
        }
    };
    actual = odata.uri.parse(input);
    same(actual.segments, expected);

    // detect custom parameters and service operations
    input = "/OData/OData.svc/ProductsByColor?color='red'";
    expected = {
        root: '/OData/OData.svc',
        resource: 'ProductsByColor',
        options: {
            params: {
                color: "'red'"
            }
        }
    };
    actual = odata.uri.parse(input);
    same(actual.segments, expected);
});

test("Stringify tests", function () {
    var odata,
        uri,
        actual,
        input,
        expected;

    // both new and current are absolute uris
    input = {
        root: 'http://services.odata.org/OData/OData.svc',
        resource: 'Category(1)/Products'
    };
    odata = oData(input);
    actual = odata.uri.parse(odata.uri.stringify());
    same(actual.segments, input);


    // both new and current are relative uris    
    input = {
        root: '/OData/OData.svc',
        resource: 'Category(1)/Products'
    };
    odata = oData(input);
    actual = odata.uri.parse(odata.uri.stringify());
    same(actual.segments, input);

    // new is relative, current is absolute uris    
    input = {
        root: 'http://services.odata.org/OData/OData.svc',
        resource: 'Category(1)/Products'
    };
    odata = oData(input);
    actual = odata.uri.parse(odata.uri.stringify());
    same(actual.segments, input);

    // new is absolute, current is relative
    odata = oData('/OData/OData.svc');
    input = {
        root: '/OData/OData.svc',
        resource: 'Category(1)/Products'
    };
    odata = oData(input);
    actual = odata.uri.parse(odata.uri.stringify());
    same(actual.segments, input);

    // detect $count                
    input = {
        root: '/OData/OData.svc',
        resource: 'Category(1)/Products',
        count: true
    };
    odata = oData(input);
    actual = odata.uri.parse(odata.uri.stringify());
    same(actual.segments, input);

    // detect $value
    input = {
        root: '/OData/OData.svc',
        resource: 'Categories(1)/Products(1)/Supplier/Address/City',
        value: true
    };
    odata = oData(input);
    actual = odata.uri.parse(odata.uri.stringify());
    same(actual.segments, input);

    // detect $links
    input = {
        root: '/OData/OData.svc',
        resource: 'Categories(1)',
        links: 'Products'
    };
    odata = oData(input);
    actual = odata.uri.parse(odata.uri.stringify());
    same(actual.segments, input);

    // detect $orderby
    input = {
        root: '/OData/OData.svc',
        resource: 'Products',
        options: {
            orderby: 'Name,ReleaseDate desc'
        }
    };
    odata = oData(input);
    actual = odata.uri.parse(odata.uri.stringify());
    same(actual.segments, input);

    // detect $orderby, $skip
    input = {
        root: '/OData/OData.svc',
        resource: 'Products',
        options: {
            orderby: 'Name,ReleaseDate desc',
            skip: 50
        }
    };
    odata = oData(input);
    actual = odata.uri.parse(odata.uri.stringify());
    same(actual.segments, input);

    // detect $orderby, $top
    input = {
        root: '/OData/OData.svc',
        resource: 'Products',
        options: {
            orderby: 'Name,ReleaseDate desc',
            skip: 50,
            top: 20
        }
    };
    odata = oData(input);
    actual = odata.uri.parse(odata.uri.stringify());
    same(actual.segments, input);

    // detect $orderby, $skip, $top, $filter
    input = {
        root: '/OData/OData.svc',
        resource: 'Products',
        options: {
            orderby: 'Name,ReleaseDate desc',
            skip: 50,
            top: 20,
            filter: "not endswith(Description,'milk')"
        }
    };
    odata = oData(input);
    actual = odata.uri.parse(odata.uri.stringify());
    same(actual.segments, input);

    // detect $orderby, $skip, $top, $filter, $expand
    input = {
        root: '/OData/OData.svc',
        resource: 'Products',
        options: {
            orderby: 'Name,ReleaseDate desc',
            skip: 50,
            top: 20,
            filter: "not endswith(Description,'milk')",
            expand: 'Category'
        }
    };
    odata = oData(input);
    actual = odata.uri.parse(odata.uri.stringify());
    same(actual.segments, input);

    // detect $select
    input = {
        root: '/OData/OData.svc',
        resource: 'Products',
        options: {
            select: 'Name,Description'
        }
    };
    odata = oData(input);
    actual = odata.uri.parse(odata.uri.stringify());
    same(actual.segments, input);

    // detect $inlinecount
    input = {
        root: '/OData/OData.svc',
        resource: 'Products',
        options: {
            inlinecount: true
        }
    };
    odata = oData(input);
    actual = odata.uri.parse(odata.uri.stringify());
    same(actual.segments, input);

    // detect $format
    expected = "/OData/OData.svc/Products?$format=text";
    input = {
        root: '/OData/OData.svc',
        resource: 'Products',
        options: {
            format: 'text'
        }
    };
    odata = oData(input);
    actual = odata.uri.parse(odata.uri.stringify());
    same(actual.segments, input);

    // detect custom parameters and service operations
    input = {
        root: '/OData/OData.svc',
        resource: 'ProductsByColor',
        options: {
            params: {
                color: "'red'"
            }
        }
    };
    odata = oData(input);
    actual = odata.uri.parse(odata.uri.stringify());
    same(actual.segments, input);
});