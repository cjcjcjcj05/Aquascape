import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Design } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { Loader2, Plus, Trash2, Edit, EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

export default function DesignsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [designToDelete, setDesignToDelete] = useState<Design | null>(null);

  // Fetch user's designs
  const { data: designs, isLoading } = useQuery<Design[]>({
    queryKey: ['/api/designs'],
    enabled: !!user,
  });

  // Delete design mutation
  const deleteDesignMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/designs/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/designs'] });
      toast({
        title: "Design deleted",
        description: "Your design has been successfully deleted.",
      });
      setDeleteDialogOpen(false);
      setDesignToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle delete confirmation
  const handleDeleteClick = (design: Design) => {
    setDesignToDelete(design);
    setDeleteDialogOpen(true);
  };

  // Confirm deletion
  const confirmDelete = () => {
    if (designToDelete) {
      deleteDesignMutation.mutate(designToDelete.id);
    }
  };

  // Handle loading a design
  const handleLoadDesign = (id: number) => {
    navigate(`/editor?design=${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">My Designs</h1>
          <Link href="/editor">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New Design
            </Button>
          </Link>
        </div>
        <p className="text-muted-foreground">Create, manage and edit your aquascaping designs</p>
      </div>

      {designs && designs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.map((design) => (
            <Card key={design.id} className="overflow-hidden">
              <div 
                className="h-48 bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => handleLoadDesign(design.id)}
              >
                <div className="w-32 h-24 border-2 border-primary-100 rounded flex items-center justify-center text-primary">
                  <span className="text-sm font-medium">
                    {design.width}cm × {design.height}cm × {design.depth}cm
                  </span>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium text-lg truncate">{design.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Last updated: {format(new Date(design.updatedAt), 'MMM d, yyyy')}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleLoadDesign(design.id)}
                  className="flex-1 mr-2"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Design
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDeleteClick(design)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-muted rounded-lg p-8 flex flex-col items-center justify-center text-center">
          <div className="bg-background rounded-full p-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Plus className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h3 className="text-xl font-medium mb-2">Create Your First Design</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Start your aquascaping journey by creating your first design. You can save, edit, and manage all your designs from here.
          </p>
          <Link href="/editor">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New Design
            </Button>
          </Link>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Design</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{designToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteDesignMutation.isPending}
            >
              {deleteDesignMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}