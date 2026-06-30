import sanityClient from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';


export const client = sanityClient({
    projectId: 'rllex1er',
    dataset: 'production',
    apiVersion: '2023-10-04',
    useCdn: true,
});

export const writeClient = sanityClient({
    projectId: 'rllex1er',
    dataset: 'production',
    apiVersion: '2023-10-04',
    useCdn: false,
    token: process.env.SANITY_TOKEN || process.env.NEXT_PUBLIC_SANITY_TOKEN,
});

const builder = imageUrlBuilder(client);

export const urlFor = (source) => builder.image(source); 