import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { deleteVaquahProduct, listAllProducts } from '@/utils/deleteProduct';
import { useToast } from '@/hooks/use-toast';

const DeleteVaquahProduct = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete the VaquaH Inverter Split AC 1.5 Ton product? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await deleteVaquahProduct();
      setResult(response);

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Product deleted successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to delete product',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleListProducts = async () => {
    setLoading(true);
    try {
      const products = await listAllProducts();
      setResult({ success: true, products, message: 'Products listed successfully' });
    } catch (error) {
      console.error('Error listing products:', error);
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-red-600" />
          Delete VaquaH Product
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          This will delete the "VaquaH Inverter Split AC 1.5 Ton" product from the database.
        </p>
        
        <div className="flex gap-2">
          <Button
            onClick={handleDelete}
            disabled={loading}
            variant="destructive"
            className="flex-1"
          >
            {loading ? 'Deleting...' : 'Delete Product'}
          </Button>
          
          <Button
            onClick={handleListProducts}
            disabled={loading}
            variant="outline"
            className="flex-1"
          >
            {loading ? 'Loading...' : 'List Products'}
          </Button>
        </div>

        {result && (
          <div className={`p-3 rounded-lg ${
            result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {result.success ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              )}
              <span className="font-medium">
                {result.success ? 'Success' : 'Error'}
              </span>
            </div>
            <p className="text-sm">
              {result.message || result.error}
            </p>
            
            {result.products && (
              <div className="mt-2">
                <p className="text-sm font-medium mb-1">Available products:</p>
                <ul className="text-xs space-y-1">
                  {result.products.map((product) => (
                    <li key={product.id} className="text-gray-600">
                      {product.name} (ID: {product.id})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeleteVaquahProduct;