import { useRef, useState, useEffect } from "react";
import { getToken } from "@/lib/storage.js";

export default function QuestionCardContent({ question, isActive, isPreview, theme, onUpdate, onChangeResponse }) {
  const { 
    type, 
    options = ["Option 1"], 
    scaleConfig = { min: 1, max: 5, minLabel: "", maxLabel: "" },
    fileConfig = { allowSpecific: false, types: { document: true, pdf: true, image: false, video: false, spreadsheet: false, presentation: false, audio: false }, maxCount: 1, maxSize: "10MB" },
    imageConfig = { url: "", alignment: "center", width: 500 },
    videoConfig = { url: "", alignment: "center", width: 500 }
  } = question;

  const [previewValue, setPreviewValue] = useState("");
  const [previewChecks, setPreviewChecks] = useState({});
  const [previewRating, setPreviewRating] = useState(0);
  const [previewScale, setPreviewScale] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileError, setFileError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [localWidth, setLocalWidth] = useState(type === 'image' ? imageConfig.width : videoConfig.width);

  const imageInputRef = useRef(null);
  const containerRef = useRef(null);
  const fileRef = useRef(null);
  const [resizing, setResizing] = useState(null);

  useEffect(() => {
    setLocalWidth(type === 'image' ? imageConfig.width : videoConfig.width);
  }, [imageConfig.width, videoConfig.width, type]);

  const handleContentUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const token = getToken();
    try {
        const response = await fetch("http://localhost:5000/api/upload", {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        });
        const data = await response.json();
        return data.status === 'success' ? data.data.url : null;
    } catch (error) { return null; }
  };

  const handleUpdateImage = (updates) => { if (isPreview) return; onUpdate(question.id, { ...question, imageConfig: { ...imageConfig, ...updates } }); };
  const handleUpdateVideo = (updates) => { if (isPreview) return; onUpdate(question.id, { ...question, videoConfig: { ...videoConfig, ...updates } }); };
  const handleUpdateOption = (index, value) => { if (isPreview) return; const newOptions = [...options]; newOptions[index] = value; onUpdate(question.id, { ...question, options: newOptions }); };
  const handleAddOption = () => { if (isPreview) return; const newOptions = [...options, `Option ${options.length + 1}`]; onUpdate(question.id, { ...question, options: newOptions }); };
  const handleRemoveOption = (index) => { if (isPreview || options.length <= 1) return; const newOptions = options.filter((_, i) => i !== index); onUpdate(question.id, { ...question, options: newOptions }); };
  const handleAddOther = () => { if (isPreview || question.hasOtherOption) return; onUpdate(question.id, { ...question, hasOtherOption: true }); };
  const handleRemoveOther = () => { if (isPreview) return; onUpdate(question.id, { ...question, hasOtherOption: false }); };
  const handleUpdateFileConfig = (updates) => { if (isPreview) return; onUpdate(question.id, { ...question, fileConfig: { ...fileConfig, ...updates } }); };
  const toggleFileType = (fileType) => { if (isPreview) return; handleUpdateFileConfig({ types: { ...fileConfig.types, [fileType]: !fileConfig.types[fileType] } }); };
  const handleUpdateScale = (key, value) => { if (isPreview) return; onUpdate(question.id, { ...question, scaleConfig: { ...scaleConfig, [key]: value } }); };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!resizing || !containerRef.current) return;
      const { side, startX, startW } = resizing;
      const dx = e.clientX - startX;
      let newW = side.includes('e') ? startW + dx * 2 : startW - dx * 2;
      const clampedWidth = Math.min(Math.max(newW, 100), 1000);
      setLocalWidth(clampedWidth);
    };
    const handleMouseUp = () => {
        if (resizing) {
            if (type === 'image') handleUpdateImage({ width: localWidth });
            if (type === 'video') handleUpdateVideo({ width: localWidth });
        }
        setResizing(null);
    };
    if (resizing) { 
        document.addEventListener("mousemove", handleMouseMove); 
        document.addEventListener("mouseup", handleMouseUp); 
        document.body.style.cursor = resizing.side + '-resize'; 
        document.body.style.userSelect = "none"; 
    }
    return () => { 
        document.removeEventListener("mousemove", handleMouseMove); 
        document.removeEventListener("mouseup", handleMouseUp); 
        document.body.style.cursor = "default"; 
        document.body.style.userSelect = "auto"; 
    };
  }, [resizing, localWidth, type]);

  const handleResizeStart = (e, side) => { 
      e.preventDefault(); e.stopPropagation();
      const rect = containerRef.current.getBoundingClientRect();
      setResizing({ side, startX: e.clientX, startW: rect.width }); 
  };

  const handleFileChange = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    setFileError("");
    if (fileConfig.allowSpecific) {
        const allowedExtensions = [];
        if (fileConfig.types.document) allowedExtensions.push('doc', 'docx', 'txt');
        if (fileConfig.types.pdf) allowedExtensions.push('pdf');
        if (fileConfig.types.image) allowedExtensions.push('jpg', 'jpeg', 'png', 'gif', 'webp');
        if (fileConfig.types.video) allowedExtensions.push('mp4', 'webm', 'mov');
        if (fileConfig.types.spreadsheet) allowedExtensions.push('xls', 'xlsx', 'csv');
        if (fileConfig.types.presentation) allowedExtensions.push('ppt', 'pptx');
        if (fileConfig.types.audio) allowedExtensions.push('mp3', 'wav', 'ogg');
        const isInvalid = uploadedFiles.some(file => !allowedExtensions.includes(file.name.split('.').pop().toLowerCase()));
        if (isInvalid) { setFileError(`Not allowed. Only: ${allowedExtensions.join(', ')}`); return; }
    }
    if (uploadedFiles.length > parseInt(fileConfig.maxCount)) { setFileError(`Max ${fileConfig.maxCount} files.`); return; }
    setSelectedFiles(uploadedFiles);
    onChangeResponse && onChangeResponse(question.id, uploadedFiles.map(f => f.name));
  };

  if (type === 'text') {
    return (
      <div className="flex flex-col gap-2 w-full animate-fade-in overflow-visible">
        <input type="text" placeholder="Text Title" value={question.title || ""} onChange={(e) => onUpdate(question.id, { ...question, title: e.target.value })} className="text-[28px] font-bold text-mahogany bg-transparent border-none outline-none w-full placeholder:text-mahogany/30" disabled={isPreview} />
        <textarea placeholder="Description (Optional)" value={question.description || ""} onChange={(e) => onUpdate(question.id, { ...question, description: e.target.value })} className="text-[18px] font-medium text-mahogany bg-transparent border-none outline-none resize-none w-full h-auto min-h-[40px] placeholder:text-mahogany/30" disabled={isPreview} />
      </div>
    );
  }

  if (type === 'image') {
    return (
      <div className="flex flex-col gap-4 w-full pt-2 overflow-visible">
        {!isPreview && <input type="file" accept="image/*" className="hidden" ref={imageInputRef} onChange={async (e) => { 
            const file = e.target.files[0]; 
            if (file) { 
                setIsUploading(true);
                const url = await handleContentUpload(file); 
                if (url) handleUpdateImage({ url }); 
                setIsUploading(false);
            } 
        }} />}
        {(imageConfig.url && isActive && !isPreview) && (
            <div className="flex gap-2 mb-2">
                {[ { id: 'left', icon: '/assets/icons/cms-form/left-align.svg' }, { id: 'center', icon: '/assets/icons/middle-align.svg' }, { id: 'right', icon: '/assets/icons/cms-form/right-align.svg' } ].map((item) => (
                    <button key={item.id} onClick={() => handleUpdateImage({ alignment: item.id })} className={`p-2 rounded-lg border transition-all ${imageConfig.alignment === item.id ? 'bg-mahogany text-rice border-mahogany' : 'bg-vanilla/50 border-mahogany/10 opacity-60 hover:opacity-100'}`}><img src={item.icon} alt={item.id} className={`w-5 h-5 ${imageConfig.alignment === item.id ? 'invert' : ''}`} /></button>
                ))}
                <div className="w-px h-8 bg-mahogany/10 mx-2"></div>
                <button onClick={() => imageInputRef.current.click()} className="flex items-center gap-2 px-4 py-2 bg-vanilla/50 rounded-lg border border-mahogany/10 text-mahogany font-bold hover:bg-vanilla transition-all">Change</button>
            </div>
        )}
        <div className={`flex w-full overflow-visible ${imageConfig.alignment === 'center' ? 'justify-center' : imageConfig.alignment === 'right' ? 'justify-end' : 'justify-start'}`}>
            {imageConfig.url ? (
                <div ref={containerRef} className={`relative group/img max-w-full inline-block overflow-visible transition-all duration-500 ${isUploading ? 'blur-lg scale-95 opacity-50' : ''}`} style={{ width: localWidth }}>
                    <img src={imageConfig.url} alt="" className="w-full h-auto rounded-2xl shadow-md border-2 border-white/50 pointer-events-none select-none" />
                    {isActive && !isPreview && !isUploading && (
                        <>
                            <button onClick={() => handleUpdateImage({ url: "" })} className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full shadow-lg opacity-0 group-hover/img:opacity-100 transition-opacity z-30"><img src="/assets/icons/cms-form/close-icon.svg" alt="" className="w-4 h-4 invert" /></button>
                            <div onMouseDown={(e) => handleResizeStart(e, "e")} className="absolute top-0 bottom-0 -right-1 w-4 cursor-ew-resize hover:bg-mahogany/20 transition-colors z-20"></div>
                            <div onMouseDown={(e) => handleResizeStart(e, "w")} className="absolute top-0 bottom-0 -left-1 w-4 cursor-ew-resize hover:bg-mahogany/20 transition-colors z-20"></div>
                            <div onMouseDown={(e) => handleResizeStart(e, "e")} className="absolute -bottom-2 -right-2 w-6 h-6 bg-mahogany border-2 border-white rounded-full cursor-nwse-resize shadow-lg z-40"></div>
                            <div onMouseDown={(e) => handleResizeStart(e, "w")} className="absolute -bottom-2 -left-2 w-6 h-6 bg-mahogany border-2 border-white rounded-full cursor-nesw-resize shadow-lg z-40"></div>
                        </>
                    )}
                </div>
            ) : !isPreview && (
                <div onClick={() => imageInputRef.current.click()} className={`w-full h-[300px] border-4 border-dashed border-mahogany/10 rounded-[30px] flex items-center justify-center cursor-pointer transition-all hover:bg-white/30 ${isUploading ? 'animate-pulse bg-vanilla/50' : ''}`}>
                    <span className="text-[20px] font-bold text-tobacco">{isUploading ? 'Uploading...' : 'Click to upload image'}</span>
                </div>
            )}
        </div>
      </div>
    );
  }

  if (type === 'video') {
    const getVideoData = (url) => { if (!url) return null; const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/; const ytMatch = url.match(ytRegExp); if (ytMatch && ytMatch[2].length === 11) return { type: 'iframe', src: `https://www.youtube-nocookie.com/embed/${ytMatch[2]}` }; const vimeoRegExp = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/; const vimeoMatch = url.match(vimeoRegExp); if (vimeoMatch) return { type: 'iframe', src: `https://player.vimeo.com/video/${vimeoMatch[3]}` }; const directVideoRegExp = /\.(mp4|webm|ogg|mov)$/i; if (directVideoRegExp.test(url)) return { type: 'video', src: url }; try { new URL(url); return { type: 'iframe', src: url }; } catch (e) { return null; } };
    const videoData = getVideoData(videoConfig.url);
    return (
      <div className="flex flex-col gap-4 w-full pt-2 overflow-visible">
        {!isPreview && (
            <div className="flex flex-col gap-2 overflow-visible">
                <div className="flex items-center gap-3 bg-vanilla/30 p-3 rounded-xl border border-mahogany/10 transition-all focus-within:bg-white/50"><input type="text" placeholder="Paste video link..." value={videoConfig.url} onChange={(e) => handleUpdateVideo({ url: e.target.value })} className="bg-transparent border-none outline-none flex-1 text-[16px]" /></div>
                {isActive && videoData && (
                    <div className="flex gap-2">
                        {[ { id: 'left', icon: '/assets/icons/cms-form/left-align.svg' }, { id: 'center', icon: '/assets/icons/middle-align.svg' }, { id: 'right', icon: '/assets/icons/cms-form/right-align.svg' } ].map((item) => (
                            <button key={item.id} onClick={() => handleUpdateVideo({ alignment: item.id })} className={`p-2 rounded-lg border transition-all ${videoConfig.alignment === item.id ? 'bg-mahogany text-rice border-mahogany' : 'bg-vanilla/50 border-mahogany/10 opacity-60 hover:opacity-100'}`}><img src={item.icon} alt={item.id} className={`w-5 h-5 ${videoConfig.alignment === item.id ? 'invert' : ''}`} /></button>
                        ))}
                    </div>
                )}
            </div>
        )}
        <div className={`flex w-full overflow-visible ${videoConfig.alignment === 'center' ? 'justify-center' : videoConfig.alignment === 'right' ? 'justify-end' : 'justify-start'}`}>
            {videoData && (
                <div ref={containerRef} className="relative group/video inline-block overflow-visible" style={{ width: localWidth }}>
                    <div className={`aspect-video w-full rounded-2xl overflow-hidden shadow-xl bg-black ${resizing ? 'pointer-events-none' : 'pointer-events-auto'}`}>
                        {videoData.type === 'iframe' ? (
                            <iframe className="w-full h-full" src={videoData.src} frameBorder="0" allowFullScreen></iframe>
                        ) : (
                            <video className="w-full h-full" controls src={videoData.src}></video>
                        )}
                    </div>
                    {isActive && !isPreview && (
                        <>
                            <div onMouseDown={(e) => handleResizeStart(e, "e")} className="absolute top-0 bottom-0 -right-1 w-4 cursor-ew-resize hover:bg-mahogany/20 transition-colors z-20"></div>
                            <div onMouseDown={(e) => handleResizeStart(e, "w")} className="absolute top-0 bottom-0 -left-1 w-4 cursor-ew-resize hover:bg-mahogany/20 transition-colors z-20"></div>
                            <div onMouseDown={(e) => handleResizeStart(e, "e")} className="absolute -bottom-2 -right-2 w-6 h-6 bg-mahogany border-2 border-white rounded-full cursor-nwse-resize shadow-lg z-40"></div>
                            <div onMouseDown={(e) => handleResizeStart(e, "w")} className="absolute -bottom-2 -left-2 w-6 h-6 bg-mahogany border-2 border-white rounded-full cursor-nesw-resize shadow-lg z-40"></div>
                        </>
                    )}
                </div>
            )}
        </div>
      </div>
    );
  }

  if (type === 'short_text' || type === 'long_text') {
    return (
      <div className="w-full pt-2 overflow-visible animate-fade-in">
        {isPreview ? (
            type === 'short_text' 
                ? <input type="text" placeholder="Your answer" onChange={(e) => onChangeResponse && onChangeResponse(question.id, e.target.value)} className="w-[60%] border-b-2 border-mahogany/30 py-3 bg-transparent outline-none focus:border-mahogany text-[20px]" />
                : <textarea placeholder="Your long answer" onChange={(e) => onChangeResponse && onChangeResponse(question.id, e.target.value)} className="w-full border-b-2 border-mahogany/30 py-3 bg-transparent outline-none focus:border-mahogany text-[20px] min-h-[120px] resize-none" />
        ) : (
            <div className="w-[80%] border-b border-mahogany/20 py-2"><span className="text-[20px] font-medium text-tobacco italic">{type === 'short_text' ? 'Short text answer...' : 'Long text answer...'}</span></div>
        )}
      </div>
    );
  }

  if (type === 'radio' || type === 'checkbox' || type === 'dropdown') {
    if (isPreview && type === 'dropdown') { return <select onChange={(e) => onChangeResponse && onChangeResponse(question.id, e.target.value)} className="w-[50%] p-4 rounded-2xl border-2 border-mahogany/20 bg-white/50 text-[20px] outline-none focus:ring-4 focus:ring-mahogany/10 cursor-pointer"><option value="">Select option</option>{options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}</select>; }
    return (
      <div className="flex flex-col gap-4 w-full pl-2 overflow-visible animate-fade-in">
        {options.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-4 group overflow-visible" onClick={() => { if (isPreview) { if (type === 'radio') { setPreviewValue(opt); onChangeResponse && onChangeResponse(question.id, opt); } if (type === 'checkbox') { const newChecks = { ...previewChecks, [idx]: !previewChecks[idx] }; setPreviewChecks(newChecks); const selected = options.filter((_, i) => newChecks[i]); onChangeResponse && onChangeResponse(question.id, selected); } } }}>
                <div className="shrink-0">{type === 'radio' && <div className={`w-6 h-6 rounded-full border-2 transition-all ${isPreview && previewValue === opt ? 'bg-mahogany border-mahogany shadow-md' : 'border-tobacco/40'}`}></div>}{type === 'checkbox' && <div className={`w-6 h-6 rounded-[6px] border-2 transition-all ${isPreview && previewChecks[idx] ? 'bg-mahogany border-mahogany shadow-md' : 'border-tobacco/40'}`}>{previewChecks[idx] && <div className="w-2 h-2 bg-white rounded-full m-auto mt-1"></div>}</div>}{!isPreview && type === 'dropdown' && <span className="text-[20px] font-medium text-mahogany/60 w-6 block">{idx + 1}.</span>}</div>
                {isPreview ? <span className={`text-[20px] font-medium transition-colors ${previewValue === opt || previewChecks[idx] ? 'text-mahogany' : 'text-mahogany/70'}`}>{opt}</span> : <input type="text" value={opt} onChange={(e) => handleUpdateOption(idx, e.target.value)} className="text-[20px] font-medium text-mahogany bg-transparent border-b border-transparent focus:border-mahogany/30 outline-none flex-1 py-1" />}
                {!isPreview && isActive && <button onClick={(e) => { e.stopPropagation(); handleRemoveOption(idx); }} className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-full transition-all"><img src="/assets/icons/cms-form/close-icon.svg" alt="" className="w-4 h-4 opacity-40" /></button>}
            </div>
        ))}
        {!isPreview && isActive && (
            <div className="flex items-center gap-4 mt-2 pl-10 overflow-visible"><button onClick={handleAddOption} className="flex items-center gap-2 text-tobacco hover:text-mahogany transition-colors"><div className="w-5 h-5 flex items-center justify-center rounded-full border border-tobacco/40"><img src="/assets/icons/cms-form/add.svg" alt="" className="w-3 h-3 opacity-60" /></div><span className="text-[18px] font-medium">Add option</span></button>{!question.hasOtherOption && <><div className="h-4 w-px bg-mahogany/20"></div><button onClick={handleAddOther} className="text-[18px] font-medium text-blue-600 hover:text-blue-800 transition-colors">Add "Other"</button></>}</div>
        )}
      </div>
    );
  }

  if (type === 'date') {
    return (
      <div className="flex items-center justify-between border-b-2 border-mahogany/20 pb-2 w-[350px] text-tobacco/60 group animate-fade-in mt-2 overflow-visible">
        {isPreview ? <input type="date" onChange={(e) => onChangeResponse && onChangeResponse(question.id, e.target.value)} className="bg-transparent border-none outline-none w-full text-mahogany font-medium text-[20px]" /> : <><span className="text-[20px] font-medium italic">Month, day, year</span><img src="/assets/icons/cms-form/type-collection/calendar.svg" alt="" className="w-7 h-7 opacity-50" /></>}
      </div>
    );
  }

  if (type === 'scale') {
    return (
      <div className="flex flex-col gap-8 w-full py-2 animate-fade-in overflow-visible">
         {isPreview ? (
            <div className="flex items-center gap-8 justify-center py-6 bg-white/20 rounded-[40px] px-10">
                <span className="text-[20px] font-bold text-mahogany shrink-0">{scaleConfig.minLabel}</span>
                <div className="flex gap-8">{Array.from({ length: scaleConfig.max - scaleConfig.min + 1 }).map((_, i) => { const val = scaleConfig.min + i; return (<div key={i} onClick={() => { setPreviewScale(val); onChangeResponse && onChangeResponse(question.id, val); }} className="flex flex-col items-center gap-3 cursor-pointer group/num"><span className={`text-[16px] font-bold transition-colors ${previewScale === val ? 'text-mahogany' : 'text-tobacco'}`}>{val}</span><div className={`w-10 h-10 rounded-full border-2 transition-all ${previewScale === val ? 'bg-mahogany border-mahogany shadow-lg scale-110' : 'border-mahogany/30 group-hover/num:border-mahogany'}`}></div></div>); })}</div>
                <span className="text-[20px] font-bold text-mahogany shrink-0">{scaleConfig.maxLabel}</span>
            </div>
         ) : (
            <div className="flex flex-col gap-4 overflow-visible">
                {isActive && (<div className="flex items-center gap-4 text-[20px] font-medium text-mahogany mb-4"><select value={scaleConfig.min} onChange={(e) => onUpdate(question.id, { ...question, scaleConfig: { ...scaleConfig, min: parseInt(e.target.value) } })} className="bg-vanilla px-3 py-1 rounded-lg border-none outline-none"><option value="0">0</option><option value="1">1</option></select><span className="text-tobacco font-bold italic">until</span><select value={scaleConfig.max} onChange={(e) => onUpdate(question.id, { ...question, scaleConfig: { ...scaleConfig, max: parseInt(e.target.value) } })} className="bg-vanilla px-3 py-1 rounded-lg border-none outline-none">{[2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}</select></div>)}
                {[scaleConfig.min, scaleConfig.max].map((val, idx) => (<div key={idx} className="flex items-center gap-6"><span className="text-[20px] font-bold text-mahogany w-6">{val}</span><input type="text" placeholder="Label (Optional)" value={idx === 0 ? scaleConfig.minLabel : scaleConfig.maxLabel} onChange={(e) => onUpdate(question.id, { ...question, scaleConfig: { ...scaleConfig, [idx === 0 ? 'minLabel' : 'maxLabel']: e.target.value } })} className="text-[20px] font-medium text-mahogany bg-transparent border-b border-mahogany/20 focus:border-mahogany outline-none flex-1" /></div>))}
            </div>
         )}
      </div>
    );
  }

  if (type === 'file') {
    return (
      <div className="w-full pt-2 animate-fade-in overflow-visible">
        {isPreview ? (
            <div className="flex flex-col gap-4 overflow-visible">
                <input type="file" ref={fileRef} multiple className="hidden" onChange={handleFileChange} />
                <div onClick={() => fileRef.current.click()} className={`w-[60%] border-4 border-dashed rounded-[40px] p-12 flex flex-col items-center gap-4 transition-all group/file ${fileError ? 'border-red-300 bg-red-50' : 'border-mahogany/20 bg-white/10 hover:bg-white/30 cursor-pointer'}`}>
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center group-hover/file:scale-110 transition-transform ${fileError ? 'bg-red-100' : 'bg-mahogany/5'}`}><img src="/assets/icons/cms-form/type-collection/upload.svg" alt="" className={`w-10 h-10 ${fileError ? 'opacity-100' : 'opacity-40'}`} /></div>
                    <div className="flex flex-col items-center gap-1 text-center"><span className={`text-[22px] font-bold ${fileError ? 'text-red-600' : 'text-mahogany'}`}>{selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : 'Add file'}</span><span className="text-[16px] text-tobacco">{fileError ? fileError : `Maximum file size: ${fileConfig.maxSize}`}</span></div>
                </div>
                {selectedFiles.length > 0 && (<div className="flex flex-col gap-2 w-[60%] animate-fade-in">{selectedFiles.map((f, i) => (<div key={i} className="flex items-center justify-between bg-white/40 p-3 rounded-xl border border-mahogany/10 transition-all"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-mahogany/10 rounded-lg flex items-center justify-center text-[10px] font-bold text-mahogany uppercase">{f.name.split('.').pop()}</div><span className="text-[14px] font-medium text-mahogany truncate max-w-[200px]">{f.name}</span></div><button onClick={() => setSelectedFiles(selectedFiles.filter((_, idx) => idx !== i))} className="p-1 hover:bg-red-50 rounded-md"><img src="/assets/icons/cms-form/close-icon.svg" alt="" className="w-4 h-4 opacity-40" /></button></div>))}</div>)}
            </div>
        ) : (
            <div className="flex flex-col gap-6 w-full overflow-visible">
                <div className="flex items-center justify-between w-[60%] overflow-visible"><span className="text-[20px] font-medium text-mahogany">Allow only certain file types</span><div onClick={() => handleUpdateFileConfig({ allowSpecific: !fileConfig.allowSpecific })} className={`w-[44px] h-[26px] rounded-[5px] flex items-center px-1 cursor-pointer transition-colors ${fileConfig.allowSpecific ? 'bg-mahogany' : 'bg-[#e4e4e4]'}`}><div className={`w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform duration-300 ${fileConfig.allowSpecific ? 'translate-x-[18px]' : 'translate-x-0'}`}></div></div></div>
                {fileConfig.allowSpecific && (<div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8 w-[80%] overflow-visible">{Object.entries(fileConfig.types).map(([key, val]) => (<div key={key} onClick={() => toggleFileType(key)} className="flex items-center gap-3 cursor-pointer group/type"><div className={`w-6 h-6 rounded-[6px] border-2 flex items-center justify-center transition-all ${val ? 'bg-mahogany border-mahogany' : 'border-tobacco/40 bg-white/50'}`}>{val && <div className="w-2 h-2 bg-white rounded-full"></div>}</div><span className={`text-[18px] font-medium capitalize ${val ? 'text-mahogany' : 'text-tobacco'}`}>{key}</span></div>))}</div>)}
                <div className="flex flex-col gap-4 mt-2 overflow-visible"><div className="flex items-center justify-between w-[60%]"><span className="text-[18px] font-medium text-mahogany">Maximum number of files</span><select value={fileConfig.maxCount} onChange={(e) => handleUpdateFileConfig({ maxCount: e.target.value })} className="bg-vanilla px-4 py-1 rounded-lg border-none outline-none font-bold"><option value="1">1</option><option value="5">5</option><option value="10">10</option></select></div><div className="flex items-center justify-between w-[60%]"><span className="text-[18px] font-medium text-mahogany">Maximum file size</span><select value={fileConfig.maxSize} onChange={(e) => handleUpdateFileConfig({ maxSize: e.target.value })} className="bg-vanilla px-4 py-1 rounded-lg border-none outline-none font-bold"><option value="1MB">1 MB</option><option value="10MB">10 MB</option><option value="100MB">100 MB</option><option value="1GB">1 GB</option></select></div></div>
            </div>
        )}
      </div>
    );
  }

  if (type === 'rating') {
    const levels = question.ratingLevels || 5;
    return (
      <div className="flex flex-col gap-6 w-full pt-2 animate-fade-in overflow-visible">
         {!isPreview && isActive && (<div className="flex items-center gap-4 text-[20px] font-medium text-mahogany overflow-visible"><span className="text-tobacco font-bold italic">Levels:</span><select value={levels} onChange={(e) => onUpdate(question.id, { ...question, ratingLevels: parseInt(e.target.value) })} className="bg-vanilla px-4 py-1 rounded-lg border-none outline-none font-bold">{[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}</select></div>)}
         <div className="flex items-center gap-4 flex-wrap overflow-visible">
            {Array.from({ length: levels }).map((_, i) => {
                const isSelected = previewRating >= i + 1;
                return (
                    <div key={i} onClick={() => { if(isPreview) { setPreviewRating(i + 1); onChangeResponse && onChangeResponse(question.id, i + 1); } }} className={`transition-all duration-300 hover:scale-125 ${isPreview ? 'cursor-pointer group/star' : ''}`}>
                        <img src={isSelected ? "/assets/icons/cms-form/type-collection/rating-filled.svg" : "/assets/icons/cms-form/type-collection/rating-outlined.svg"} alt="" className={`w-12 h-12 transition-all ${isSelected ? 'opacity-100 scale-110 shadow-google-btn-hover' : 'opacity-40'}`} />
                    </div>
                );
            })}
         </div>
      </div>
    );
  }

  if (type === 'section') {
    return (
      <div className="flex flex-col gap-2 w-full animate-fade-in overflow-visible">
        <input 
            type="text" 
            placeholder="Section Title" 
            value={question.title || ""} 
            onChange={(e) => onUpdate(question.id, { ...question, title: e.target.value })} 
            className="text-[32px] font-bold text-mahogany bg-transparent border-none outline-none w-full placeholder:text-mahogany/30" 
            disabled={isPreview} 
        />
        <textarea 
            placeholder="Description (Optional)" 
            value={question.description || ""} 
            onChange={(e) => onUpdate(question.id, { ...question, description: e.target.value })} 
            className="text-[18px] font-medium text-mahogany bg-transparent border-none outline-none resize-none w-full h-auto min-h-[40px] placeholder:text-mahogany/30" 
            disabled={isPreview} 
        />
      </div>
    );
  }

  return null;
}
