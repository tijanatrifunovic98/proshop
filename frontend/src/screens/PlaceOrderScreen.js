import React, {useState, useEffect} from 'react'
import { Button, Row, Col, ListGroup, Image, Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import CheckoutSteps from '../components/CheckoutSteps'
import { createOrder } from '../actions/orderActions'
import CurrencyRow from '../components/CurrencyRow'
import { ORDER_CREATE_RESET } from '../constants/orderConstants'
function PlaceOrderScreen({ history }) {
    //KONVERTER VALUTA
    const BASE_URL = 'http://api.exchangeratesapi.io/v1/latest?access_key=3c03298fb6f417ea8e2479f79ec0733f'
    const [currencyOptions, setCurrencyOptions] = useState([])
    //console.log(currencyOptions)
    const [fromCurrency, setFromCurrency] = useState()
    const [toCurrency, setToCurrency] = useState()
    const [exchangeRate, setExchangeRate] = useState()
    const [amount, setAmount] = useState(1)
    const [amountInFromCurrency, setAmountInFromCurrency]=useState(true)
    //console.log(exchangeRate)
    //KONVERTER VALUTA
    let toAmount, fromAmount
    if(amountInFromCurrency){
        fromAmount=amount
        toAmount=amount*exchangeRate
    }else{
        toAmount=amount
        fromAmount=amount / exchangeRate
    }

    const orderCreate = useSelector(state => state.orderCreate)
    const { order, error, success } = orderCreate

    const dispatch = useDispatch()

    const cart = useSelector(state => state.cart)

    cart.itemsPrice = cart.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2)
    cart.shippingPrice = (cart.itemsPrice > 100 ? 0 : 10).toFixed(2)
    cart.taxPrice = Number((0.082) * cart.itemsPrice).toFixed(2)
    cart.totalPrice = Number(Number(cart.itemsPrice) + Number(cart.shippingPrice) + Number(cart.taxPrice)).toFixed(2)
    fromAmount=cart.totalPrice

    if(!cart.paymentMethod){
        //ako ga nemamo vrati se unazad
        history.push('/payment')
    }


    useEffect(()=>{
        if(success){
            history.push(`/order/${order._id}`)
            dispatch({type:ORDER_CREATE_RESET}) //brisanje iz local storage kad se poruci
        }
    }, [success, history])

    useEffect(()=>{
        fetch(BASE_URL)
            .then(res=>res.json())
            //.then(data=> console.log(data))
            .then(data => {
                const firstCurrency=Object.keys(data.rates)[0]
                setCurrencyOptions([data.base, ...Object.keys(data.rates)])
                setFromCurrency(data.base)
                setToCurrency(firstCurrency)
                setExchangeRate(data.rates[firstCurrency])
            })
            
    },[])

    useEffect(()=>{
        if(fromCurrency!=null && toCurrency!=null){
            //console.log("Nisu null")
            fetch(`${BASE_URL}?base=${fromCurrency}&symbols=${toCurrency}&access_key=3c03298fb6f417ea8e2479f79ec0733f`)
                .then(res=>res.json())
                .then(data => setExchangeRate(data.rates[toCurrency]))
        }
    },[fromCurrency, toCurrency])

    const placeOrder = () => {
        //console.log("Place order");
        dispatch(createOrder({
            orderItems:cart.cartItems,
            shippingAddress:cart.shippingAddress,
            paymentMethod:cart.paymentMethod,
            itemsPrice:cart.itemsPrice,
            shippingPrice:cart.shippingPrice,
            taxPrice:cart.taxPrice,
            totalPrice:cart.totalPrice,
        }))
    }
    return (
        <div>
            <CheckoutSteps step1 step2 step3 step4/>
            <Row>
                <Col md={8}>
                    <ListGroup variant='flush'>
                        <ListGroup.Item>
                            <h2>Shipping</h2>
                            <p>
                                <strong>Shipping: </strong>
                                {cart.shippingAddress.address},
                                {cart.shippingAddress.city},
                                {'  '}
                                {cart.shippingAddress.postalCode},
                                {'  '}
                                {cart.shippingAddress.country}
                            </p>
                        </ListGroup.Item>

                        <ListGroup.Item>
                            <h2>Payment Method</h2>
                            <p>
                                <strong>Method: </strong>
                                {cart.paymentMethod}
                            </p>
                        </ListGroup.Item>

                        <ListGroup.Item>
                            <h2>Order Items</h2>
                            {cart.cartItems.length === 0 ? <Message variant='info'>
                                Your cart is empty.
                            </Message> : (
                                //prolazenje kroz listu
                                <ListGroup variant='flush'>
                                    {cart.cartItems.map((item, index) => (
                                        <ListGroup.Item key={index}>
                                            <Row>
                                                <Col md={1}>
                                                    <Image src={item.image} alt={item.name} fluid rounded/>
                                                </Col>

                                                <Col>
                                                    <Link to={`/product/${item.product}`}>{item.name}</Link>
                                                </Col>
                                                <Col md={4}>
                                                    {item.qty} X ${item.price} = ${(item.qty * item.price).toFixed(2)}
                                                </Col>
                                            </Row>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </ListGroup.Item>

                    </ListGroup>
                </Col>

                <Col md={4}>
                    <Card>
                        <ListGroup variant='flush'>
                            <ListGroup.Item>
                                <h2>Order Summary</h2>
                            </ListGroup.Item>

                            <ListGroup.Item>
                                <Row>
                                    <Col>Items:</Col>
                                    <Col>${cart.itemsPrice}</Col>
                                </Row>
                            </ListGroup.Item>

                            <ListGroup.Item>
                                <Row>
                                    <Col>Shipping:</Col>
                                    <Col>${cart.shippingPrice}</Col>
                                </Row>
                            </ListGroup.Item>

                            <ListGroup.Item>
                                <Row>
                                    <Col>Tax:</Col>
                                    <Col>${cart.taxPrice}</Col>
                                </Row>
                            </ListGroup.Item>

                            <ListGroup.Item>
                                <Row>
                                    <Col>Total:</Col>
                                    <Col>${cart.totalPrice}</Col>
                                </Row>
                            </ListGroup.Item>

                            <ListGroup.Item>
                                <h2>Convert</h2>
                                <CurrencyRow 
                                    currencyOptions={currencyOptions}
                                    selectedCurrency={fromCurrency}
                                    onChangeCurrency={e => setFromCurrency(e.target.value)}
                                    amount={fromAmount}
                                />
                                <div className="equals">=</div>
                                <CurrencyRow 
                                    currencyOptions={currencyOptions}
                                    selectedCurrency={toCurrency}
                                    onChangeCurrency={e => setToCurrency(e.target.value)}
                                    amount={toAmount}
                                />
                            </ListGroup.Item>

                            <ListGroup.Item>
                               {error && <Message variant='danger'>{error}</Message>}
                            </ListGroup.Item>

                            <ListGroup.Item>
                               <Button
                                    type='button'
                                    className='btn-block'
                                    disabled={cart.cartItems === 0}
                                    onClick={placeOrder}
                               >
                                   Place Order
                               </Button>
                            </ListGroup.Item>

                        </ListGroup>
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default PlaceOrderScreen
