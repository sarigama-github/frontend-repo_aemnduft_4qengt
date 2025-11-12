import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, Star, Link as LinkIcon, Download, Filter, Clock, ChevronDown, X, FileText, FileSpreadsheet, File, HelpCircle } from 'lucide-react'

const BRAND = {
  primary: '#6366F1',
  secondary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B'
}

const API = import.meta.env.VITE_BACKEND_URL || ''

function FileIcon({format}){
  if(format==='PDF') return <FileText className="text-rose-500" size={18} />
  if(format==='XLSX') return <FileSpreadsheet className="text-emerald-600" size={18} />
  if(format==='DOCX') return <File className="text-indigo-600" size={18} />
  return <File size={18} />
}

function Badge({ tone='gray', children }){
  const map = {
    gray: 'bg-gray-100 text-gray-700',
    type: 'bg-indigo-50 text-indigo-700',
    dept: 'bg-emerald-50 text-emerald-700',
    latest: 'bg-emerald-100 text-emerald-800',
    outdated: 'bg-amber-100 text-amber-800'
  }
  return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${map[tone] || map.gray}`}>{children}</span>
}

function Header({ onSearch, query, onOpenBookmarks, onOpenHelp }) {
  const inputRef = useRef(null)
  useEffect(()=>{
    function onKey(e){
      if(e.key==='/' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA'){
        e.preventDefault(); inputRef.current?.focus()
      }
      if(e.key==='?' && e.shiftKey){ onOpenHelp?.() }
    }
    window.addEventListener('keydown', onKey)
    return ()=>window.removeEventListener('keydown', onKey)
  },[])
  return (
    <header className="w-full border-b bg-white sticky top-0 z-30">
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center gap-4" role="banner">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-indigo-100 flex items-center justify-center font-bold text-indigo-600" aria-hidden>TV</div>
          <span className="font-semibold text-gray-800">TechVista HR</span>
        </div>
        <div className="flex-1">
          <SearchInput inputRef={inputRef} value={query} onChange={onSearch} />
        </div>
        <nav className="flex items-center gap-2" aria-label="Quick links">
          <button onClick={onOpenBookmarks} className="text-sm text-gray-700 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded px-2 py-1">Bookmarks</button>
          <button onClick={onOpenHelp} className="text-sm text-gray-700 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded px-2 py-1 flex items-center gap-1"><HelpCircle size={16}/> Help</button>
          <div className="w-8 h-8 rounded-full bg-gray-200" aria-label="User avatar" />
        </nav>
      </div>
    </header>
  )
}

function SearchInput({ value, onChange, placeholder = 'Search policies, forms, or departments…', inputRef }){
  return (
    <div className="relative group">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} aria-hidden />
      <input
        ref={inputRef}
        value={value}
        onChange={(e)=>onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 pl-10 pr-12 rounded-xl bg-white border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none transition text-[15px]"
        aria-label="Global search"
      />
      <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs bg-gray-50 border px-1.5 py-0.5 rounded" aria-hidden>/</kbd>
    </div>
  )
}

function FilterPanel({ open, types, departments, active, onToggle, onClear, onApplyDate }){
  if(!open) return null
  return (
    <aside className="w-72 shrink-0 p-4 border-r bg-white" aria-label="Filters">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">Filters</h3>
        <button onClick={onClear} className="text-sm text-indigo-600 hover:underline">Clear all</button>
      </div>
      <div className="space-y-5">
        <section>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Type</h4>
          <div className="flex flex-wrap gap-2">
            {types.map(t => (
              <button key={t} onClick={()=>onToggle('doc_type', t)} className={`px-3 py-1.5 rounded-lg text-sm border ${active.doc_type===t? 'bg-indigo-50 border-indigo-200 text-indigo-700':'border-gray-200 text-gray-700 hover:border-gray-300'}`}>{t}</button>
            ))}
          </div>
        </section>
        <section>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Department</h4>
          <div className="flex flex-wrap gap-2">
            {departments.map(d => (
              <button key={d} onClick={()=>onToggle('department', d)} className={`px-3 py-1.5 rounded-lg text-sm border ${active.department?.includes(d)? 'bg-emerald-50 border-emerald-200 text-emerald-700':'border-gray-200 text-gray-700 hover:border-gray-300'}`}>{d}</button>
            ))}
          </div>
        </section>
        <section>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Date Updated</h4>
          <div className="grid grid-cols-2 gap-2">
            <input type="date" onChange={(e)=>onApplyDate('from', e.target.value)} className="h-10 px-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300" aria-label="From date" />
            <input type="date" onChange={(e)=>onApplyDate('to', e.target.value)} className="h-10 px-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300" aria-label="To date" />
          </div>
        </section>
      </div>
    </aside>
  )
}

function DocumentRow({ item, onPreview, onFavorite, onCopy }){
  return (
    <div className="group grid grid-cols-[auto_1fr_auto] gap-4 items-center px-4 py-3 rounded-xl border border-gray-200 hover:border-indigo-200 bg-white shadow-sm/50 hover:shadow-md transition">
      <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center" aria-hidden>
        <FileIcon format={item.format} />
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={()=>onPreview(item)} className="text-[15px] font-medium text-gray-900 hover:underline text-left">{item.title}</button>
          <Badge tone="type">{item.doc_type}</Badge>
          {item.latest ? <Badge tone="latest">Latest</Badge> : <Badge tone="outdated">Outdated</Badge>}
        </div>
        <div className="mt-1 text-sm text-gray-600 flex flex-wrap items-center gap-2">
          <span>Last updated • {new Date(item.last_updated).toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric'})}</span>
          <span aria-hidden>· {item.format}</span>
          <span aria-hidden>· {item.size_kb} KB</span>
          {item.departments?.map(d=> <Badge key={d} tone="dept">{d}</Badge>)}
        </div>
      </div>
      <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition">
        <button onClick={()=>onPreview(item)} className="h-9 px-3 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-300">Preview</button>
        <button onClick={()=>onFavorite(item)} className="h-9 w-9 rounded-lg border border-gray-200 hover:bg-gray-50" aria-label="Favorite"><Star size={16} /></button>
        <button onClick={()=>onCopy(item)} className="h-9 w-9 rounded-lg border border-gray-200 hover:bg-gray-50" aria-label="Copy link"><LinkIcon size={16} /></button>
      </div>
    </div>
  )
}

function Modal({ open, onClose, children }){
  useEffect(()=>{
    function onKey(e){ if(e.key==='Escape') onClose?.() }
    if(open){ window.addEventListener('keydown', onKey) }
    return ()=>window.removeEventListener('keydown', onKey)
  },[open])
  if(!open) return null
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center p-6">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-[1100px] max-w-[95vw] rounded-2xl shadow-xl grid grid-cols-[1fr_320px] overflow-hidden">
        {children}
        <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full bg-white/80 border border-gray-200 hover:bg-white focus:ring-2 focus:ring-indigo-300" aria-label="Close"><X size={16} /></button>
      </div>
    </div>
  )
}

function PreviewPane({ item, onCopy, onDownload }){
  return (
    <>
      <div className="min-h-[620px] bg-gray-50 flex items-center justify-center">
        <div className="w-[680px] h-[520px] bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-center text-gray-500">Preview placeholder</div>
      </div>
      <div className="border-l p-6 space-y-3">
        <div className="flex items-center gap-2">
          <FileIcon format={item.format} />
          <h3 className="font-semibold text-gray-900">{item.title}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="type">{item.doc_type}</Badge>
          {item.departments?.map(d=> <Badge key={d} tone="dept">{d}</Badge>)}
          {item.latest ? <Badge tone="latest">Latest</Badge> : <Badge tone="outdated">Outdated</Badge>}
        </div>
        <p className="text-sm text-gray-600">Last updated • {new Date(item.last_updated).toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric'})} · {item.format} · {item.size_kb} KB</p>
        <div className="pt-2 flex gap-2">
          <button onClick={()=>onDownload(item)} className="h-10 px-4 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-300 flex items-center gap-2"><Download size={16}/> Download latest version</button>
          <button onClick={()=>onCopy(item)} className="h-10 px-3 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm flex items-center gap-2"><LinkIcon size={16}/> Copy link</button>
        </div>
      </div>
    </>
  )
}

function EmptyState({ title, body }){
  return (
    <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-2xl">
      <div className="mx-auto w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 mb-3"><Search size={18}/></div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{body}</p>
    </div>
  )
}

function Toast({ open, label }){
  if(!open) return null
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg">{label}</div>
  )
}

function Login({ onLogin }){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center p-6">
      <div className="w-[420px] max-w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 font-bold grid place-items-center">TV</div>
          <div>
            <div className="font-semibold text-gray-900">TechVista HR</div>
            <div className="text-sm text-gray-600">Document Access</div>
          </div>
        </div>
        <form onSubmit={(e)=>{e.preventDefault(); onLogin(email)}} className="space-y-3">
          <label className="block">
            <span className="text-sm text-gray-700">Email</span>
            <input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} className="mt-1 w-full h-11 px-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"/>
          </label>
          <label className="block">
            <span className="text-sm text-gray-700">Password</span>
            <input type="password" required value={password} onChange={(e)=>setPassword(e.target.value)} className="mt-1 w-full h-11 px-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"/>
          </label>
          <div className="flex items-center justify-between pt-1">
            <a className="text-sm text-indigo-600 hover:underline" href="#" onClick={(e)=>e.preventDefault()}>Forgot password?</a>
          </div>
          <button type="submit" className="w-full h-11 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-300">Sign in</button>
        </form>
      </div>
    </div>
  )
}

function SuggestedChips({ items, onPick }){
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((t)=> (
        <button key={t} onClick={()=>onPick(t)} className="h-9 px-3 rounded-full border border-gray-200 bg-white text-gray-700 hover:border-gray-300">{t}</button>
      ))}
    </div>
  )
}

function FooterShortcuts(){
  return (
    <footer className="w-full border-t bg-white">
      <div className="max-w-[1200px] mx-auto px-6 h-12 flex items-center gap-6 text-xs text-gray-600">
        <span><kbd className="px-1 py-0.5 border rounded bg-gray-50">/</kbd> Focus search</span>
        <span><kbd className="px-1 py-0.5 border rounded bg-gray-50">?</kbd> Open help</span>
        <span><kbd className="px-1 py-0.5 border rounded bg-gray-50">Esc</kbd> Close dialogs</span>
      </div>
    </footer>
  )
}

function HelpOverlay({ open, onClose }){
  if(!open) return null
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}/>
      <div className="relative max-w-[760px] mx-auto mt-24 bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Learn to find documents faster</h3>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
          <li>Use the global search to find titles, types, and departments.</li>
          <li>Refine with filters like Type, Department, and Date Range.</li>
          <li>Preview documents, then download the latest version.</li>
          <li>Favorite frequently used items and copy stable links to share.</li>
        </ol>
        <div className="mt-4 text-right">
          <button onClick={onClose} className="h-10 px-4 rounded-lg bg-indigo-600 text-white text-sm">Got it</button>
        </div>
      </div>
    </div>
  )
}

function Home({ query, setQuery, onOpenResults, onPreview, onFavorite, onCopy, suggestedTypes, recents }){
  return (
    <main className="flex-1">
      <div className="max-w-[1200px] mx-auto px-6 py-6">
        <div className="grid grid-cols-[1fr] gap-6">
          <div className="bg-white border rounded-2xl p-6">
            <div className="text-sm text-gray-700 mb-2">Search documents, types, departments…</div>
            <div className="flex gap-3">
              <div className="flex-1"><SearchInput value={query} onChange={(v)=>setQuery(v)} /></div>
              <button onClick={onOpenResults} className="h-11 px-5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500">Search</button>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm text-gray-600">Suggested:</span>
              <SuggestedChips items={suggestedTypes} onPick={(t)=>{setQuery(t); onOpenResults()}} />
            </div>
          </div>
          <section className="bg-white border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Recent documents</h3>
              <div className="text-sm text-gray-600 flex items-center gap-1"><Clock size={14}/> Updated recently</div>
            </div>
            <div className="grid gap-3">
              {recents.map((it)=> (
                <DocumentRow key={it.id} item={it} onPreview={onPreview} onFavorite={onFavorite} onCopy={onCopy} />
              ))}
              {recents.length===0 && <EmptyState title="No recent items" body="Documents will appear here as they get updated." />}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

function Results({ query, filters, setFilters, results, onPreview, onFavorite, onCopy, onSort, sort }){
  const activePills = []
  if(filters.doc_type) activePills.push(['Type', filters.doc_type])
  if(filters.department?.length) activePills.push(...filters.department.map(d=>['Dept', d]))
  if(filters.date_from || filters.date_to) activePills.push(['Date', `${filters.date_from||'Any'} → ${filters.date_to||'Any'}`])
  const [openFilters, setOpenFilters] = useState(true)
  const types = ['Policies','Forms','Templates','Guides','Checklists']
  const departments = ['Engineering','Sales','Marketing','Operations','Finance','Customer Support','Design']
  function toggle(kind, value){
    if(kind==='doc_type'){
      setFilters(v=> ({...v, doc_type: v.doc_type===value? null : value}))
    } else if(kind==='department'){
      setFilters(v=> {
        const set = new Set(v.department||[]); set.has(value)? set.delete(value): set.add(value)
        return {...v, department: Array.from(set)}
      })
    }
  }
  function clearAll(){ setFilters({}) }
  function applyDate(which, val){ setFilters(v=> ({...v, [which==='from'? 'date_from':'date_to']: val||null})) }

  return (
    <div className="flex">
      <FilterPanel open={openFilters} types={types} departments={departments} active={filters} onToggle={toggle} onClear={clearAll} onApplyDate={applyDate} />
      <main className="flex-1">
        <div className="max-w-[1200px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button onClick={()=>setOpenFilters(v=>!v)} className="h-10 px-3 rounded-lg border bg-white flex items-center gap-2"><Filter size={16}/> Filters</button>
              <div className="text-sm text-gray-600">{results.length} results for <span className="font-medium text-gray-800">{query || 'all documents'}</span></div>
            </div>
            <div>
              <label className="text-sm text-gray-600 mr-2">Sort</label>
              <select value={sort} onChange={(e)=>onSort(e.target.value)} className="h-10 px-3 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300">
                <option value="relevance">Relevance</option>
                <option value="last_updated">Last updated</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {activePills.map(([k,v],i)=> <span key={i} className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm">{k}: {v}</span>)}
          </div>
          <div className="grid gap-3">
            {results.map((it)=> (
              <DocumentRow key={it.id} item={it} onPreview={onPreview} onFavorite={onFavorite} onCopy={onCopy} />
            ))}
            {results.length===0 && <EmptyState title="No documents match your filters" body="Try adjusting filters or search terms." />}
          </div>
        </div>
      </main>
    </div>
  )
}

function Bookmarks({ items, team }){
  return (
    <main className="flex-1">
      <div className="max-w-[1200px] mx-auto px-6 py-6 space-y-6">
        <section className="bg-white border rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Your favorites</h3>
          <div className="grid gap-3">
            {items.map((it)=> <DocumentRow key={it.id} item={it} onPreview={()=>{}} onFavorite={()=>{}} onCopy={()=>{}} />)}
            {items.length===0 && <EmptyState title="No favorites yet" body="Star documents to see them here." />}
          </div>
        </section>
        <section className="bg-white border rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Team bookmarks</h3>
          <div className="grid gap-3">
            {team.map((it)=> <DocumentRow key={it.id} item={it} onPreview={()=>{}} onFavorite={()=>{}} onCopy={()=>{}} />)}
            {team.length===0 && <EmptyState title="No team bookmarks" body="Shared bookmarks appear here." />}
          </div>
        </section>
      </div>
    </main>
  )
}

export default function App(){
  const [user, setUser] = useState(null)
  const [view, setView] = useState('home') // home | results | bookmarks
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({})
  const [sort, setSort] = useState('relevance')
  const [suggested, setSuggested] = useState({ suggested_types: [], suggested_departments: [] })
  const [recents, setRecents] = useState([])
  const [results, setResults] = useState([])
  const [preview, setPreview] = useState(null)
  const [toast, setToast] = useState(null)
  const [helpOpen, setHelpOpen] = useState(false)

  // Load initial data
  useEffect(()=>{
    fetch(`${API}/api/suggested`).then(r=>r.json()).then(setSuggested).catch(()=>{})
    fetch(`${API}/api/recents`).then(r=>r.json()).then(setRecents).catch(()=>{})

    // read URL param for canonical link
    const url = new URL(window.location.href)
    const canonical = url.searchParams.get('doc')
    if(canonical){
      fetch(`${API}/api/canonical/${canonical}/latest`).then(r=>r.json()).then(setPreview).catch(()=>{})
    }
  },[])

  // Fetch results whenever query/filters/sort change on results view
  useEffect(()=>{
    if(view!=="results") return
    const params = new URLSearchParams()
    if(query) params.set('q', query)
    if(filters.doc_type) params.set('doc_type', filters.doc_type)
    if(filters.department?.length) params.set('departments', filters.department.join(','))
    if(filters.date_from) params.set('date_from', filters.date_from)
    if(filters.date_to) params.set('date_to', filters.date_to)
    if(sort) params.set('sort', sort)
    fetch(`${API}/api/documents?${params.toString()}`).then(r=>r.json()).then(setResults).catch(()=>setResults([]))
  },[view, query, filters, sort])

  function openResults(){ setView('results') }

  function copyLink(item){
    const url = new URL(window.location.href)
    url.searchParams.set('doc', item.canonical_id || item.id)
    navigator.clipboard.writeText(url.toString())
    setToast('Link copied')
    setTimeout(()=>setToast(null), 1600)
  }

  async function favorite(item){
    if(!user){ setToast('Please sign in to save favorites'); setTimeout(()=>setToast(null), 1500); return }
    try{
      await fetch(`${API}/api/favorites`, {
        method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ user_id: user, document_id: item.id })
      })
      setToast('Added to favorites')
      setTimeout(()=>setToast(null), 1500)
    }catch(e){ /* ignore */ }
  }

  const [favItems, setFavItems] = useState([])
  const [teamBookmarks, setTeamBookmarks] = useState([])
  useEffect(()=>{
    if(view!=='bookmarks') return
    if(user){
      fetch(`${API}/api/favorites?user_id=${encodeURIComponent(user)}`).then(r=>r.json()).then(setFavItems).catch(()=>setFavItems([]))
    }
    fetch(`${API}/api/bookmarks?shared=true`).then(r=>r.json()).then(setTeamBookmarks).catch(()=>setTeamBookmarks([]))
  },[view, user])

  if(!user){
    return <Login onLogin={(email)=>{ setUser(email) }} />
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900" style={{'--brand': BRAND.primary}}>
      <Header query={query} onSearch={setQuery} onOpenBookmarks={()=>setView('bookmarks')} onOpenHelp={()=>setHelpOpen(true)} />
      {view==='home' && (
        <Home query={query} setQuery={setQuery} onOpenResults={openResults} onPreview={setPreview} onFavorite={favorite} onCopy={copyLink} suggestedTypes={suggested.suggested_types || []} recents={recents} />
      )}
      {view==='results' && (
        <Results query={query} filters={filters} setFilters={setFilters} results={results} onPreview={setPreview} onFavorite={favorite} onCopy={copyLink} onSort={setSort} sort={sort} />
      )}
      {view==='bookmarks' && (
        <Bookmarks items={favItems} team={teamBookmarks} />
      )}

      <FooterShortcuts />

      <Modal open={!!preview} onClose={()=>setPreview(null)}>
        {preview && <PreviewPane item={preview} onCopy={copyLink} onDownload={(it)=>{ window.open(it.download_url, '_blank', 'noopener') }} />}
      </Modal>
      <HelpOverlay open={helpOpen} onClose={()=>setHelpOpen(false)} />
      <Toast open={!!toast} label={toast} />
    </div>
  )
}
