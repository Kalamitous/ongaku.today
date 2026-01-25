import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";

interface GenericDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  triggerButton?: React.ReactNode;
  children: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  confirmDisabled?: boolean;
  showCancel?: boolean;
  footerExtra?: React.ReactNode;
}

export function GenericDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  triggerButton,
  children,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  confirmDisabled = false,
  showCancel = true,
  footerExtra
}: GenericDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {children}
        </div>
        <DialogFooter>
          <div className="flex justify-between w-full">
            {footerExtra || <div />}
            <div className="flex gap-2">
              {showCancel && (
                <DialogClose asChild>
                  <Button variant="outline">
                    {cancelText}
                  </Button>
                </DialogClose>
              )}
              <Button onClick={onConfirm} disabled={confirmDisabled}>
                {confirmText}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}