import ProductCard from './ProductCard';
export default function ProductList({ items }) {
  if (!items.length) return <p>Không có sản phẩm phù hợp.</p>;
  return <div className="grid">{items.map(p => <ProductCard key={p.id} p={p} />)}</div>;
}
