
import React from "react";
import { Button } from "@/components/ui/button";

interface FixedActionBarProps {
  total: number;
  quantity?: number;
  buttonLabel: string;
  onButtonClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const FixedActionBarProduct: React.FC<FixedActionBarProps> = ({
  total,
  quantity,
  buttonLabel,
  onButtonClick,
  loading,
  disabled,
}) => {
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-white shadow-t px-4 py-3 flex items-center justify-between gap-3 border-t border-gray-200 md:hidden animate-fade-in">
      <div>
        <div className="font-semibold text-gray-800 text-base">Valor do Produto</div>
        <div className="text-sm text-gray-600">
          
          <span className="font-bold text-lg text-gray-800">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(total)}
          </span>
          {/* {typeof quantity === "number" && (
            <span className="ml-2 text-gray-500">
              / {quantity} {quantity === 1 ? "item" : "itens"}
            </span>
          )} */}
        </div>
      </div>
      <Button
        className="min-w-[130px] h-12 px-6 bg-[#B40206] text-[#ffffff] font-bold text-base rounded-md"
        onClick={onButtonClick}
        disabled={loading || disabled}
      >
        {buttonLabel}
      </Button>
    </div>
  );
};

export default FixedActionBarProduct;
