import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Star, ThumbsUp, Send } from "lucide-react";

const Feedback = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [complaintId, setComplaintId] = useState("");
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: t('feedback.submittedTitle', 'Feedback Submitted Successfully'),
      description: t('feedback.submittedDesc', 'Thank you for your valuable feedback. It helps us improve our services.'),
    });

    // Reset form
    setComplaintId("");
    setRating(0);
    setFeedback("");
  };

  const renderStars = () => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`p-1 transition-colors ${
              star <= (hoveredStar || rating)
                ? "text-yellow-400"
                : "text-gray-300"
            }`}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            onClick={() => setRating(star)}
          >
            <Star className="h-8 w-8 fill-current" />
          </button>
        ))}
      </div>
    );
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return "Very Dissatisfied";
      case 2: return "Dissatisfied";
      case 3: return "Neutral";
      case 4: return "Satisfied";
      case 5: return "Very Satisfied";
      default: return "Please rate our service";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">{t('feedback.title', 'Share Your Feedback')}</h1>
          <p className="text-lg text-muted-foreground">
            {t('feedback.subtitle', "Help us improve our services by sharing your experience")}
          </p>
        </div>

        {/* Feedback Stats */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ThumbsUp className="h-5 w-5 mr-2 text-success" />
              {t('feedback.stats.title', 'Your Voice Matters')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-primary mb-1">95%</div>
                <div className="text-sm text-muted-foreground">{t('feedback.stats.satisfaction', 'Citizen Satisfaction')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary mb-1">15,000+</div>
                <div className="text-sm text-muted-foreground">{t('feedback.stats.received', 'Feedback Received')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary mb-1">24 Hours</div>
                <div className="text-sm text-muted-foreground">{t('feedback.stats.responseTime', 'Average Response Time')}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t('feedback.form.title', 'Rate Our Service')}</CardTitle>
            <CardDescription>
              {t('feedback.form.desc', 'Your feedback helps us provide better service to all citizens')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Complaint ID (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="complaintId">{t('feedback.form.complaintId', 'Complaint ID (Optional)')}</Label>
                <Input
                  id="complaintId"
                  value={complaintId}
                  onChange={(e) => setComplaintId(e.target.value)}
                  placeholder={t('feedback.form.complaintIdPlaceholder', 'e.g., CMP123456')}
                  className="uppercase"
                />
                <p className="text-sm text-muted-foreground">
                  {t('feedback.form.complaintIdHelp', 'If your feedback is related to a specific complaint, please enter the complaint ID')}
                </p>
              </div>

              {/* Rating */}
              <div className="space-y-4">
                <Label>{t('feedback.form.ratingLabel', 'Overall Satisfaction Rating *')}</Label>
                <div className="flex flex-col items-center space-y-4 p-6 border rounded-lg">
                  {renderStars()}
                  <p className="text-lg font-medium text-center">
                    {getRatingText(rating)}
                  </p>
                  {rating > 0 && (
                    <p className="text-sm text-muted-foreground text-center">
                      {rating <= 2 
                        ? t('feedback.form.ratingLow', "We're sorry to hear about your experience. Your feedback will help us improve.")
                        : rating === 3
                        ? t('feedback.form.ratingMid', "Thank you for your feedback. We'll work to exceed your expectations.")
                        : t('feedback.form.ratingHigh', "Thank you for your positive feedback! We're glad we could help.")
                      }
                    </p>
                  )}
                </div>
              </div>

              {/* Detailed Feedback */}
              <div className="space-y-2">
                <Label htmlFor="feedback">{t('feedback.form.commentsLabel', 'Your Comments and Suggestions')}</Label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={t('feedback.form.commentsPlaceholder', 'Please share your experience with our service. What did we do well? How can we improve?')}
                  className="min-h-32"
                />
                <p className="text-sm text-muted-foreground">
                  {t('feedback.form.commentsHelp', "Your detailed feedback helps us understand what's working and what needs improvement")}
                </p>
              </div>

              {/* Feedback Categories */}
              <div className="space-y-4">
                <Label>{t('feedback.form.categoryLabel', 'What aspect would you like to comment on? (Select all that apply)')}</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    t('feedback.form.cat.responseTime', 'Response Time'),
                    t('feedback.form.cat.staff', 'Staff Behavior'),
                    t('feedback.form.cat.clarity', 'Process Clarity'),
                    t('feedback.form.cat.quality', 'Resolution Quality'),
                    t('feedback.form.cat.communication', 'Communication'),
                    t('feedback.form.cat.website', 'Website/Portal Experience'),
                    t('feedback.form.cat.followup', 'Follow-up Service'),
                    t('feedback.form.cat.overall', 'Overall Experience')
                  ].map((category) => (
                    <label key={category} className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Anonymous Option */}
              <div className="bg-muted/30 p-4 rounded-lg">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">
                    {t('feedback.form.anon', 'Submit feedback anonymously (your personal information will not be recorded)')}
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={rating === 0}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {t('feedback.form.submit', 'Submit Feedback')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>{t('feedback.info.title', 'How We Use Your Feedback')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium mb-2">{t('feedback.info.service', 'Service Improvement:')}</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• {t('feedback.info.point1', 'Identify areas for improvement')}</li>
                  <li>• {t('feedback.info.point2', 'Enhance training programs')}</li>
                  <li>• {t('feedback.info.point3', 'Streamline processes')}</li>
                  <li>• {t('feedback.info.point4', 'Update policies and procedures')}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">{t('feedback.info.quality', 'Quality Assurance:')}</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• {t('feedback.info.q1', 'Monitor service standards')}</li>
                  <li>• {t('feedback.info.q2', 'Recognize excellent performance')}</li>
                  <li>• {t('feedback.info.q3', 'Address systemic issues')}</li>
                  <li>• {t('feedback.info.q4', 'Ensure citizen satisfaction')}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Feedback;