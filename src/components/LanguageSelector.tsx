import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Languages, Globe } from "lucide-react";
import { useLanguage, SUPPORTED_LANGUAGES, Language } from "@/contexts/LanguageContext";

interface LanguageSelectorProps {
  variant?: "compact" | "full";
  showDialog?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  variant = "compact", 
  showDialog = false 
}) => {
  const { currentLanguage, setLanguage } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(lang =>
    lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLanguageSelect = (language: Language) => {
    setLanguage(language);
    setIsOpen(false);
  };

  if (variant === "compact" && !showDialog) {
    return (
      <Select 
        value={currentLanguage.code} 
        onValueChange={(code) => {
          const language = SUPPORTED_LANGUAGES.find(lang => lang.code === code);
          if (language) setLanguage(language);
        }}
      >
        <SelectTrigger className="w-32 h-8 bg-primary-foreground text-primary">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-80">
          <ScrollArea className="h-72">
            {SUPPORTED_LANGUAGES.map((language) => (
              <SelectItem key={language.code} value={language.code}>
                <span className="flex items-center gap-2">
                  <span className="font-medium">{language.nativeName}</span>
                  <span className="text-xs text-muted-foreground">({language.name})</span>
                </span>
              </SelectItem>
            ))}
          </ScrollArea>
        </SelectContent>
      </Select>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {showDialog ? (
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {currentLanguage.nativeName}
          </Button>
        ) : (
          <Button variant="secondary" size="sm" className="flex items-center gap-2">
            <Languages className="h-4 w-4" />
            Select Language
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Select Your Preferred Language
          </DialogTitle>
          <DialogDescription>
            Choose from {SUPPORTED_LANGUAGES.length} supported Indian languages for the best experience
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search languages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="text-sm text-muted-foreground">
            Currently selected: <Badge variant="secondary">{currentLanguage.nativeName}</Badge>
          </div>

          <ScrollArea className="h-96">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {filteredLanguages.map((language) => (
                <Button
                  key={language.code}
                  variant={currentLanguage.code === language.code ? "default" : "outline"}
                  className={`h-auto p-3 justify-start text-left ${
                    language.rtl ? 'font-arabic' : ''
                  }`}
                  onClick={() => handleLanguageSelect(language)}
                  dir={language.rtl ? 'rtl' : 'ltr'}
                >
                  <div className="flex flex-col items-start w-full">
                    <span className="font-semibold text-base">
                      {language.nativeName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {language.name} ({language.code})
                    </span>
                    {language.rtl && (
                      <Badge variant="secondary" className="text-xs mt-1">RTL</Badge>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>

          {filteredLanguages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Languages className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No languages found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};