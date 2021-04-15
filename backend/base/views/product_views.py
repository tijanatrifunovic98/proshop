from django.shortcuts import render

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from base.models import Product, Review
from base.products import products
from base.serializers import ProductSerializer


from rest_framework import status

@api_view(['GET'])
def getProducts(request):
    query = request.query_params.get('keyword')
    print('query:', query)
    if query == None:
        query = ''
    products = Product.objects.filter(name__icontains=query)
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

@api_view(['POST'])
def uploadImage(request):
    data = request.data
    product_id = data['product_id']
    product = Product.objects.get(_id=product_id)

    product.image=request.FILES.get('image')
    product.save()
    return Response('Image was uploaded')



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def createProductReview(request, pk):
    user = request.user
    product = Product.objects.get(_id=pk)
    data = request.data

    #1 - Review vec postoji, ako je korisnik vec napisao za taj proizvod obavesti ga
    alreadyExists = product.review_set.filter(user=user).exists()
    if alreadyExists:
        content = {'detail':'Product already reviewed'}
        return Response(content, status=status.HTTP_400_BAD_REQUEST)
    #2 - Review je prosledjen bez ocene
    elif data['rating'] == 0:
        content = {'detail':'Please select a rating'}
        return Response(content, status=status.HTTP_400_BAD_REQUEST)
    #3 - Pravljenje review-a ako je sve u redu
    else:
        review = Review.objects.create(
            user=user,
            product=product,
            name=user.first_name,
            rating=data['rating'],
            comment=data['comment']
        )
        reviews = product.review_set.all()
        product.numReviews = len(reviews)

        total = 0
        for i in reviews:
            total += i.rating
        
        product.rating = total / len(reviews)
        product.save()

        return Response('Review Added')



