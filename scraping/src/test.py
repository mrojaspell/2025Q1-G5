from lib import normalize_price

def test_normalize_price():
    # Test delimiter
    price = "$ 129"
    price = normalize_price(price,"$ ",False,False)
    assert price == "129"

    # Test american_fmt
    price = "124.90"
    price = normalize_price(price,None,True,False)
    assert price == "124,90"

    price = "1,124.90"
    price = normalize_price(price,None,True,True)
    assert price == "1.124,90"

    # Test american_fmt and delimiter
    price = "$ 124.90"
    price = normalize_price(price,"$ ",True,False)
    assert price == "124,90"

    price = "$ 1,124.90"
    price = normalize_price(price,"$ ",True,True)
    assert price == "1.124,90"

    #Test thousand delimiter
    price = "123456"
    price = normalize_price(price,None,False,False)
    assert price == "123.456"


    price = "456"
    price = normalize_price(price,None,False,False)
    assert price == "456"

    price = "123456,50"
    price = normalize_price(price,None,False,False)
    assert price == "123.456,50"

    #Test delimiter and thousand delimiter
    price = "$ 123456"
    price = normalize_price(price,"$ ",False,False)
    assert price == "123.456"

    #Test american and thousand delimiter
    price = "123456.50"
    price = normalize_price(price,None,True,False)
    assert price == "123.456,50"


    price = "456.50"
    price = normalize_price(price,None,True,False)
    assert price == "456,50"

    #Test delimiter and american and thousand delimiter
    price = "$ 123456.50"
    price = normalize_price(price,"$ ",True,False)
    assert price == "123.456,50",print(price)


    #Fails because only changes the first dot found
    #Result: 1.211,124,90

    price = "$ 1,211,124.90"
    price = normalize_price(price,"$ ",True,True)
    assert price == "1.211.124,90"


test_normalize_price()