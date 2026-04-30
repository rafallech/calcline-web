type ResultRow = {
  label: string;
  value: string;
  unit?: string;
};

type ResultTableProps = {
  rows: ResultRow[];
  emptyMessage?: string;
};

export function ResultTable({
  rows,
  emptyMessage = "No results yet.",
}: ResultTableProps) {
  if (rows.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-600">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-slate-200">
      <table className="w-full table-fixed text-left text-sm">
        <tbody className="divide-y divide-slate-200">
          {rows.map((row) => (
            <tr key={row.label} className="bg-white">
              <th scope="row" className="w-2/5 px-3 py-2.5 font-medium text-slate-600">
                {row.label}
              </th>
              <td className="break-words px-3 py-2.5 text-right font-semibold text-slate-950">
                {row.value}
                {row.unit ? (
                  <span className="ml-1 font-normal text-slate-500">
                    {row.unit}
                  </span>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
