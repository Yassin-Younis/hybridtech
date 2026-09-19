// Where the admin panel (/admin/) reads and commits the catalogue. The panel talks to the GitHub
// API directly with a fine-grained token (Contents: read & write on this repo), see README.
export const admin = {
  owner: 'Yassin-Younis',
  repo: 'hybridtech',
  branch: 'main',
  paths: { products: 'src/data/products.json', categories: 'src/data/categories.json', images: 'public/products' },
  /** Public path prefix stored in product.image (served from public/products). */
  imagePrefix: 'products',
};
