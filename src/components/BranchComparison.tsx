import React from 'react';
import type { NarrativeBranch } from '../types/plotline';

interface BranchComparisonProps {
  branches: NarrativeBranch[];
}

export const BranchComparison: React.FC<BranchComparisonProps> = ({ branches }) => {
  if (branches.length === 0) return null;

  const statusText = (status: NarrativeBranch['status']) => {
    switch (status) {
      case 'experimental':
        return 'Saved as Experiment';
      case 'rejected':
        return 'Rejected';
      case 'promoted_partial':
        return 'Selected Ideas Promoted to Canon';
      default:
        return 'Unassigned Direction';
    }
  };

  return (
    <div className="stationery-card rounded-3xl overflow-hidden">
      <div className="px-6 py-4 bg-[#FFF5F9] border-b border-[#EFA7C5]/35">
        <h3 className="font-editorial text-xl font-bold text-[#4F3048]">
          Branch Comparison Matrix
        </h3>
        <p className="text-xs text-[#6E626C] mt-0.5">
          Compare narrative tradeoffs side by side without reductive scoring or predictions.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[720px]">
          <thead>
            <tr className="border-b border-[#EFA7C5]/35 bg-[#FFFAFC]">
              <th className="py-3.5 px-4 text-xs font-semibold text-[#766B74] w-44">Dimension</th>
              {branches.map((br) => (
                <th key={br.id} className="py-3.5 px-4 text-sm font-editorial font-bold text-[#4F3048]">
                  {br.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EFA7C5]/25 text-sm">
            <tr>
              <td className="py-3.5 px-4 text-xs font-semibold text-[#4F3048] align-top">
                Main Narrative Direction
              </td>
              {branches.map((br) => (
                <td key={br.id} className="py-3.5 px-4 text-[#6E626C] align-top leading-relaxed">
                  <div className="text-xs font-semibold text-[#B93778] mb-1">
                    {br.approachLabel}
                  </div>
                  {br.premise}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3.5 px-4 text-xs font-semibold text-[#4F3048] align-top">
                Biggest Consequence
              </td>
              {branches.map((br) => (
                <td key={br.id} className="py-3.5 px-4 text-[#6E626C] align-top leading-relaxed">
                  {br.plotConsequences[0] || '—'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3.5 px-4 text-xs font-semibold text-[#4F3048] align-top">
                Characters Affected
              </td>
              {branches.map((br) => (
                <td key={br.id} className="py-3.5 px-4 text-[#4F3048] align-top">
                  {br.charactersAffected.length > 0 ? br.charactersAffected.join(', ') : '—'}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3.5 px-4 text-xs font-semibold text-[#4F3048] align-top">
                Potential Canon Conflicts
              </td>
              {branches.map((br) => (
                <td key={br.id} className="py-3.5 px-4 text-xs text-[#6E626C] align-top">
                  {br.continuityConflicts.length === 0 ? (
                    <span>None flagged</span>
                  ) : (
                    <ul className="space-y-1 list-disc pl-4">
                      {br.continuityConflicts.map((cf) => (
                        <li key={cf.id}>
                          <span className="font-medium text-[#B93778]">
                            {cf.relatedCanonTitle}:
                          </span>{' '}
                          {cf.description}
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3.5 px-4 text-xs font-semibold text-[#4F3048] align-top">
                Current Status
              </td>
              {branches.map((br) => (
                <td key={br.id} className="py-3.5 px-4 text-xs font-semibold text-[#4F3048] align-top">
                  {statusText(br.status)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
