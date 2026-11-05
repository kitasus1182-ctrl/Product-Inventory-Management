import { useEffect, useState } from 'react';
import { getMovements } from '../services/api.js';
import MovementTable from '../components/MovementTable.jsx';

export default function MovementsPage() {
  const [movements, setMovements] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getMovements()
      .then((data) => setMovements(data.movements))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <>
      {error && <p className="error">{error}</p>}
      <MovementTable movements={movements} />
    </>
  );
}