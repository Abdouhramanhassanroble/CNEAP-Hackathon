import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const NotFound = () => (
  <div className="max-w-6xl mx-auto px-6 py-24 text-center">
    <h1 className="text-6xl font-light tracking-tight mb-4" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>404</h1>
    <p className="text-lg text-muted-foreground mb-8" style={{ fontWeight: 300 }}>Cette page n'existe pas.</p>
    <Link to="/" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
      <ArrowLeft size={14} /> Retour à l'accueil
    </Link>
  </div>
);

export default NotFound;
