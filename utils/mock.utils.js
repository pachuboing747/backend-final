const { faker } = require('@faker-js/faker')

const generateProducts = ( count = 100 ) => {
    const products = []

    for(let i = 0; i < count; i++){
        products.push({
            status: true,
            title: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            code: faker.commerce.isbn({ variant: 5, separator: ''}),
            price: faker.number.int({ min: 50, max: 5000 }),
            stock: faker.number.int({ min: 10, max: 500 }),
            category: faker.commerce.productMaterial(),
            thumbnail: faker.image.url()
        })
    }

    return products
}

module.exports = generateProducts