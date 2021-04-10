import React, {useState, useEffect} from 'react'
import { Form, Button } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import FormContainer from '../components/FormContainer'
import { saveShippingAddress } from '../actions/cartActions'

function ShippingScreen({history}) {

    const cart = useSelector(state => state.cart)
    const { shippingAddress } = cart
    //izvlacimo iz korpe ako postoji shipping address i onda pocetno stanje punimo sa tim
    //iz local storage-a
    const dispatch = useDispatch()

    const [address, setAddress] = useState(shippingAddress? shippingAddress.address:'')
    const [city, setCity] = useState(shippingAddress? shippingAddress.city:'')
    const [postalCode, setPostalCode] = useState(shippingAddress? shippingAddress.postalCode:'')
    const [country, setCountry] = useState(shippingAddress? shippingAddress.country:'')

    const submitHandler = (e) => {
        e.preventDefault();
        //console.log("Submitted.")
        dispatch(saveShippingAddress({address, city, postalCode, country}))
        //idi na sl stranu
        history.push('/payment')
    }
    return (
        <FormContainer>
            <h1>Shipping</h1>
            <Form onSubmit={submitHandler}>

            <Form.Group controlId='address'>
                        <Form.Label>
                            Address
                        </Form.Label>
                        <Form.Control
                            required
                            type='text'
                            placeholder='Enter Address'
                            value={address ? address : ''}
                            onChange={(e)=> setAddress(e.target.value)}
                        >
                        </Form.Control>
            </Form.Group>

            <Form.Group controlId='city'>
                        <Form.Label>
                            City
                        </Form.Label>
                        <Form.Control
                            required
                            type='text'
                            placeholder='Enter City'
                            value={city ? city : ''}
                            onChange={(e)=> setCity(e.target.value)}
                        >
                        </Form.Control>
            </Form.Group>

            <Form.Group controlId='postalCode'>
                        <Form.Label>
                            Postal Code
                        </Form.Label>
                        <Form.Control
                            required
                            type='text'
                            placeholder='Enter Postal Code'
                            value={postalCode ? postalCode : ''}
                            onChange={(e)=> setPostalCode(e.target.value)}
                        >
                        </Form.Control>
            </Form.Group>

            <Form.Group controlId='country'>
                        <Form.Label>
                            Postal Country
                        </Form.Label>
                        <Form.Control
                            required
                            type='text'
                            placeholder='Enter Country'
                            value={country ? country : ''}
                            onChange={(e)=> setCountry(e.target.value)}
                        >
                        </Form.Control>
            </Form.Group>
            <Button type='submit'
                    variant='primary'>
                Continue
            </Button>

            </Form>
        </FormContainer>
    )
}

export default ShippingScreen
