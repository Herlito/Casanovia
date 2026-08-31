import re

with open('src/components/private/TableAssignmentModule.tsx', 'r') as f:
    content = f.read()

# Replace maroon banner container
content = re.sub(
    r'className="bg-gradient-to-r from-\[\#6B2D38\] via-\[\#7D3442\] to-\[\#8B3A4A\] rounded-3xl p-6 text-white shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-6"',
    'className="bg-[#EBEBEB] rounded-[2.5rem] p-6 text-gray-800 shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] flex flex-col lg:flex-row lg:items-center justify-between gap-6"',
    content
)

# Text and mini badges inside banner
content = re.sub(
    r'text-\[10px\] font-bold uppercase tracking-widest px-2\.5 py-0\.5 rounded-full bg-white\/20 text-\[\#F7E7CE\]',
    'text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] bg-[#EBEBEB] text-gray-700',
    content
)
content = re.sub(
    r'text-\[10px\] font-semibold text-stone-200',
    'text-[10px] font-semibold text-gray-600',
    content
)
content = re.sub(
    r'text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2\.5',
    'text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2.5',
    content
)
content = re.sub(
    r'text-\[\#F7E7CE\]',
    'text-gray-800',
    content
)
content = re.sub(
    r'text-xs sm:text-sm text-stone-200 leading-relaxed',
    'text-xs sm:text-sm text-gray-600 leading-relaxed',
    content
)

# Buttons inside banner (Diseñador, Nueva Mesa, Auto-distribuir, Imprimir)
content = re.sub(
    r'px-4 py-2\.5 rounded-xl bg-\[\#F7E7CE\] hover:bg-white text-\[\#54212C\] text-xs font-bold transition-all shadow-md',
    'px-4 py-2.5 rounded-2xl bg-[#EBEBEB] text-gray-800 text-xs font-bold transition-all shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]',
    content
)
content = re.sub(
    r'px-3\.5 py-2\.5 rounded-xl bg-white\/20 hover:bg-white\/30 text-white text-xs font-bold transition-all border border-white\/30',
    'px-3.5 py-2.5 rounded-2xl bg-[#EBEBEB] text-gray-800 text-xs font-bold transition-all shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] border-none',
    content
)
content = re.sub(
    r'px-3\.5 py-2\.5 rounded-xl bg-white\/15 hover:bg-white\/25 text-white text-xs font-semibold transition-all border border-white\/20',
    'px-3.5 py-2.5 rounded-2xl bg-[#EBEBEB] text-gray-800 text-xs font-semibold transition-all shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] border-none',
    content
)
content = re.sub(
    r'px-3\.5 py-2\.5 rounded-xl bg-white\/10 hover:bg-white\/20 text-white text-xs font-semibold transition-all border border-white\/20',
    'px-3.5 py-2.5 rounded-2xl bg-[#EBEBEB] text-gray-800 text-xs font-semibold transition-all shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] border-none',
    content
)

# Replace summary cards (CANTIDAD DE MESAS, CAPACIDAD TOTAL, etc.)
content = re.sub(
    r'bg-white rounded-3xl p-4 sm:p-5 border border-\[\#EDE5DA\] shadow-sm flex flex-col relative overflow-hidden',
    'bg-[#EBEBEB] rounded-[2.5rem] p-4 sm:p-5 shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] flex flex-col relative overflow-hidden border-none',
    content
)

# Now for table cards
content = re.sub(
    r'bg-white rounded-3xl border border-\[\#EDE5DA\] shadow-xs overflow-hidden flex flex-col transition-all',
    'bg-[#EBEBEB] rounded-[2.5rem] shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] overflow-hidden flex flex-col transition-all border-none mb-4',
    content
)

# And guest lists / input fields inside search
content = re.sub(
    r'bg-white rounded-3xl border border-\[\#EDE5DA\] shadow-xs p-4 sm:p-5 flex flex-col space-y-4',
    'bg-[#EBEBEB] rounded-[2.5rem] shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] p-4 sm:p-5 flex flex-col space-y-4 border-none',
    content
)

# Search bar
content = re.sub(
    r'w-full pl-9 pr-4 py-2\.5 bg-\[\#F9F8F6\] border border-\[\#E8DCCF\] rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-\[\#8B3A4A\]\/20 transition-all',
    'w-full pl-9 pr-4 py-2.5 bg-[#EBEBEB] rounded-2xl text-sm shadow-[inset_5px_5px_10px_#d1d1d1,inset_-5px_-5px_10px_#ffffff] focus:outline-hidden transition-all border-none',
    content
)

with open('src/components/private/TableAssignmentModule.tsx', 'w') as f:
    f.write(content)
