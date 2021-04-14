from django.shortcuts import render

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from base.models import Product
from base.products import products
from base.serializers import ProductSerializer


from rest_framework import status

@api_view(['GET'])
def getProducts(request):
    products = Product.objects.all()
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def getProduct(request,pk):
    product = Product.objects.get(_id=pk)
    serializer = ProductSerializer(product, many=False)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def createProduct(request):
    user=request.user
    product = Product.objects.create(
        user=user,
        name='Sample Name',
        price=0,
        brand='Sample Brand',
        countInStock=0,
        category='Sample Category',
        description=''
    ) #pravimo proizvod i posle menjamo ove vrednosti
    serializer = ProductSerializer(product, many=False)
    return Response(serializer.data) #ovo ce da ispuni tu formu na frontend-u

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def updateProduct(request, pk):
    data = request.data #uzimamo podatke sa forme
    product = Product.objects.get(_id=pk) #nalazimo proizvod po id-u
    #azuriramo vrednosti
    product.name=data['name']
    product.price=data['price']
    product.countInStock=data['countInStock']
    product.category=data['category']
    product.brand=data['brand']
    product.description=data['description']

    product.save() #cuvamo izmenjen proizvod

    serializer = ProductSerializer(product, many=False)
    return Response(serializer.data)



@api_view(['DELETE'])
@permission_classes([IsAdminUser]) #samo admin moze da brise
def deleteProduct(request, pk):
    product = Product.objects.get(_id=pk)
    product.delete()
    return Response('Product Deleted')
