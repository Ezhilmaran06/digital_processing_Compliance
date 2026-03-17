import React from 'react';
import { createPortal } from 'react-dom';
import { X, Star, MessageSquare, Send, Calendar, Check } from 'lucide-react';
import { toast } from 'sonner';
import requestService from '../services/requestService';

const FeedbackModal = ({ isOpen, onClose, requestId, requestTitle, existingFeedback, readOnly = false, onSubmitSuccess }) => {
    // Using direct React.useState to completely eliminate ReferenceError risk
    const [rating, setRating] = React.useState(existingFeedback?.rating || 0);
    const [hover, setHover] = React.useState(0);
    const [feedback, setFeedback] = React.useState(existingFeedback?.note || '');
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    // Sync state if existingFeedback changes
    React.useEffect(() => {
        if (isOpen) {
            if (existingFeedback) {
                setRating(existingFeedback.rating || 0);
                setFeedback(existingFeedback.note || '');
            } else {
                setRating(0);
                setFeedback('');
            }
            // Prevent background scrolling
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [existingFeedback, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (readOnly) return;

        if (rating === 0) {
            toast.error("Please provide a star rating");
            return;
        }

        setIsSubmitting(true);
        try {
            console.log('Submitting feedback for request:', requestId);
            const response = await requestService.submitFeedback(requestId, rating, feedback);
            console.log('Feedback submission response:', response);

            toast.success("Feedback submitted successfully. Thank you!");
            if (onSubmitSuccess) onSubmitSuccess();
            onClose();
        } catch (error) {
            console.error('Feedback submission error:', error);
            const message = error.response?.data?.message || "Failed to submit feedback";
            toast.error(message);
            if (message === "Feedback has already been submitted for this request.") {
                onClose();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-[440px] bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.5)] border border-white/20 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 fade-in duration-300 max-h-[95vh] flex flex-col">

                {/* Header - Compact */}
                <div className="px-5 py-3.5 bg-indigo-600 relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-400/20 rounded-full -ml-8 -mb-8 blur-xl"></div>

                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30">
                                <Star className="w-5 h-5 text-white fill-white animate-pulse" />
                            </div>
                            <div>
                                <h2 className="text-base font-black text-white leading-tight">Review Record</h2>
                                <p className="text-indigo-100 text-[9px] font-bold uppercase tracking-[0.1em] opacity-80">Post-Implementation Audit</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-xl text-white transition-all active:scale-90"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Body - Split Scroll Layout */}
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900">

                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                        {/* Compact Request Box */}
                        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors overflow-hidden group">
                            <span className="text-[9px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block mb-1">Target Request</span>
                            <p className="text-sm font-black text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {requestTitle || "Unnamed Request"}
                            </p>

                            {readOnly && (
                                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
                                    {existingFeedback?.submittedBy && (
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                            <span>Submitted by: {existingFeedback.submittedBy}</span>
                                        </div>
                                    )}
                                    {existingFeedback?.submittedAt && (
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                                            <Calendar className="w-3 h-3 text-indigo-500" />
                                            <span>Submitted on {new Date(existingFeedback.submittedAt).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Star Rating */}
                        <div className="text-center space-y-2">
                            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">Rate Satisfaction</p>
                            <div className="flex items-center justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => !readOnly && setRating(star)}
                                        onMouseEnter={() => !readOnly && setHover(star)}
                                        onMouseLeave={() => !readOnly && setHover(0)}
                                        className={`p-1 focus:outline-none transition-all ${!readOnly ? 'hover:scale-110 active:scale-95 cursor-pointer' : 'cursor-default'}`}
                                    >
                                        <Star
                                            className={`w-8 h-8 transition-all ${(hover || rating) >= star
                                                ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                                                : 'text-slate-200 dark:text-slate-800'
                                                }`}
                                            strokeWidth={1.5}
                                        />
                                    </button>
                                ))}
                            </div>
                            <div className="h-4">
                                {(hover || rating) > 0 && (
                                    <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                                        {(hover || rating) === 5 ? 'Exceptional' : (hover || rating) === 4 ? 'Great Work' : (hover || rating) === 3 ? 'Satisfactory' : (hover || rating) === 2 ? 'Needs Attention' : 'Unsatisfactory'}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Feedback Text */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <MessageSquare className="w-3 h-3 text-indigo-500" />
                                    Submission Notes
                                </label>
                                {!readOnly && (
                                    <span className={`text-[9px] font-black ${feedback.length > 450 ? 'text-rose-500' : 'text-slate-400'}`}>
                                        {feedback.length}/500
                                    </span>
                                )}
                            </div>
                            <textarea
                                readOnly={readOnly}
                                className={`w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm font-bold text-slate-800 dark:text-slate-200 transition-all placeholder-slate-400/60 h-[100px] overflow-y-auto resize-none scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 ${readOnly ? 'cursor-default' : 'focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/5'}`}
                                placeholder={readOnly ? ((!existingFeedback || !existingFeedback.rating) ? "No employee feedback submitted for this request." : "No qualitative feedback provided.") : "Share your experience with the process..."}
                                maxLength={500}
                                value={feedback}
                                onChange={(e) => !readOnly && setFeedback(e.target.value)}
                            ></textarea>
                        </div>
                    </div>

                    {/* Fixed Footer Actions */}
                    <div className="p-5 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="flex gap-3">
                            {readOnly ? (
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Check className="w-3.5 h-3.5" />
                                    Close Review
                                </button>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-[1.5] py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <Send className="w-3 h-3" />
                                                Submit Review
                                            </>
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
        , document.body);
};

export default FeedbackModal;
