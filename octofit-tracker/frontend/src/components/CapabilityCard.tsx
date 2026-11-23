import { useEffect, useState, type ReactNode } from 'react';

type Props<T> = {
  title: string;
  description: string;
  loadItems: () => Promise<T[]>;
  emptyText: string;
  itemKey: (item: T, index: number) => string;
  renderItem: (item: T) => ReactNode;
};

export function CapabilityCard<T>({ title, description, loadItems, emptyText, itemKey, renderItem }: Props<T>) {
  const [items, setItems] = useState<T[] | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;
    void loadItems()
      .then((response) => {
        if (active) setItems(response);
      })
      .catch(() => {
        if (active) setHasError(true);
      });
    return () => { active = false; };
  }, [loadItems]);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {hasError ? <p role="alert">Não foi possível carregar os dados. Tente novamente.</p>
          : items === null ? <p role="status">Carregando...</p>
            : items.length === 0 ? <p role="status">{emptyText}</p>
              : <ul className="list-group list-group-flush">{items.map((item, index) => <li className="list-group-item" key={itemKey(item, index)}>{renderItem(item)}</li>)}</ul>}
      </div>
    </section>
  );
}
