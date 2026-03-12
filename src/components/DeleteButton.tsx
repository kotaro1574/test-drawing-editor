"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  drawingId: string;
};

export function DeleteButton({ drawingId }: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("この絵を削除しますか？")) return;

    setIsDeleting(true);

    const response = await fetch(`/api/drawings/${drawingId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      router.push("/gallery");
    } else {
      setIsDeleting(false);
      alert("削除に失敗しました");
    }
  };

  return (
    <Button
      variant="destructive"
      size="lg"
      className="gap-2"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      <Trash2 className="w-5 h-5" />
      {isDeleting ? "削除中..." : "この絵を削除する"}
    </Button>
  );
}
