/* test or production servers */
export const domain = process.env.NODE_ENV === 'development' ? 
    'http://localhost:8072' : 'https://trans-bdit.intra.prod-toronto.ca/tt-request-backend'