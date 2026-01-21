import { Library } from "@/components/library/library";

export default function LibraryDemo() {
  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Library Demo</h1>
          <p className="text-muted-foreground">
            A file explorer-like component for managing nested folders and music library.
          </p>
        </div>
        
        <Library />
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <h3 className="font-semibold">Features:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Nested folder structure with navigation</li>
            <li>Create new folders inside existing folders</li>
            <li>Select and navigate folders</li>
            <li>Edit folder names and locations</li>
            <li>Delete folders with confirmation</li>
            <li>Breadcrumb navigation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}