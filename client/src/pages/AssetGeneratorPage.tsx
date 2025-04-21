import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Image as ImageIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AssetCategory } from "@/lib/types";

// Form schema
const assetGeneratorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name cannot exceed 50 characters"),
  category: z.enum(["plants", "hardscape", "fish", "substrate"], {
    required_error: "Please select a category",
  }),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description cannot exceed 500 characters"),
  prompt: z.string().min(10, "Prompt must be at least 10 characters").max(1000, "Prompt cannot exceed 1000 characters"),
  style: z.enum(["realistic", "artistic", "simple"], {
    required_error: "Please select a style",
  }),
  backgroundColor: z.enum(["transparent", "white", "gradient"], {
    required_error: "Please select a background option",
  }),
});

type AssetGeneratorFormValues = z.infer<typeof assetGeneratorSchema>;

export default function AssetGeneratorPage() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"form" | "preview">("form");

  const defaultPrompt = "A photorealistic aquarium plant with detailed leaves and texture, completely isolated with transparent background, studio lighting, high detail, 8k";
  
  // Set up form with default values
  const form = useForm<AssetGeneratorFormValues>({
    resolver: zodResolver(assetGeneratorSchema),
    defaultValues: {
      name: "",
      category: "plants",
      description: "",
      prompt: defaultPrompt,
      style: "realistic",
      backgroundColor: "transparent",
    },
  });

  // Helper function to update the prompt based on other fields
  const updatePrompt = (category: AssetCategory, style: string) => {
    let basePrompt = "";
    
    switch (category) {
      case "plants":
        basePrompt = "A photorealistic aquarium plant with detailed leaves and texture";
        break;
      case "hardscape":
        basePrompt = "A detailed aquarium decoration rock/wood piece with natural texture";
        break;
      case "fish":
        basePrompt = "A detailed tropical aquarium fish with vibrant colors";
        break;
      case "substrate":
        basePrompt = "Aquarium substrate texture, top-down view";
        break;
      default:
        basePrompt = "Aquarium decoration item";
    }
    
    let styleModifier = "";
    switch (style) {
      case "realistic":
        styleModifier = "photorealistic, studio lighting, high detail, 8k";
        break;
      case "artistic":
        styleModifier = "stylized, vibrant colors, artistic rendering";
        break;
      case "simple":
        styleModifier = "simple, clean lines, minimalist style";
        break;
    }
    
    return `${basePrompt}, completely isolated with transparent background, ${styleModifier}`;
  };

  // Watch for changes to category and style
  const watchCategory = form.watch("category") as AssetCategory;
  const watchStyle = form.watch("style");
  
  // Update prompt when category or style changes
  // Use the form.watch directly for category and style changes
  form.watch((value, { name }) => {
    if (name === "category" || name === "style") {
      const newPrompt = updatePrompt(
        value.category as AssetCategory, 
        value.style as string
      );
      form.setValue("prompt", newPrompt);
    }
  });

  // Form submission handler
  const onSubmit = async (values: AssetGeneratorFormValues) => {
    setIsGenerating(true);
    try {
      // API request to generate image
      const response = await fetch('/api/generate-asset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate asset');
      }
      
      const data = await response.json();
      
      // Set the generated image URL
      setGeneratedImageUrl(data.imageUrl);
      setActiveTab("preview");
      
      toast({
        title: "Asset Generated",
        description: "Your asset has been successfully generated.",
      });
    } catch (error) {
      console.error('Error generating asset:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "There was an error generating your asset.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold">AI Asset Generator</h1>
        <p className="text-muted-foreground">Create custom assets for your aquascape designs using AI</p>
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-md text-amber-800">
          <p className="font-medium">Developer Feature</p>
          <p className="text-sm mt-1">This tool is for development purposes only and is not part of the main application features.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "form" | "preview")}>
        <TabsList className="grid grid-cols-2 w-[400px] mb-6">
          <TabsTrigger value="form">Generation Form</TabsTrigger>
          <TabsTrigger value="preview" disabled={!generatedImageUrl}>Asset Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="form">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Asset Details</CardTitle>
                  <CardDescription>Describe the asset you want to generate</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Asset Name</FormLabel>
                            <FormControl>
                              <Input placeholder="E.g., Amazon Sword Plant" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="plants">Plants</SelectItem>
                                <SelectItem value="hardscape">Hardscape</SelectItem>
                                <SelectItem value="fish">Fish</SelectItem>
                                <SelectItem value="substrate">Substrate</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe the asset in detail..."
                                className="min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              This description will be used in the asset library.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="style"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Visual Style</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex space-x-2"
                              >
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="realistic" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Realistic
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="artistic" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Artistic
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="simple" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Simple
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="backgroundColor"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Background</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex space-x-2"
                              >
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="transparent" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Transparent
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="white" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    White
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="gradient" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Gradient
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="prompt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Generation Prompt (Advanced)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Detailed prompt for AI image generation..."
                                className="min-h-[150px] font-mono text-sm"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              You can customize this prompt for more control over the generated image.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full md:w-auto"
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <ImageIcon className="mr-2 h-4 w-4" />
                            Generate Asset
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Generation Tips</CardTitle>
                  <CardDescription>How to get the best results</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-medium mb-1">Be Specific</h3>
                    <p className="text-muted-foreground">
                      The more details you provide in your description, the better
                      the results will be.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-1">Plants</h3>
                    <p className="text-muted-foreground">
                      For plants, mention leaf shape, color, and growth pattern.
                      Examples: "Amazon sword with broad green leaves" or "Red carpet
                      plant with small round leaves".
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-1">Hardscape</h3>
                    <p className="text-muted-foreground">
                      For rocks and wood, describe texture, color, and shape.
                      Examples: "Dragon stone with rough texture and holes" or
                      "Twisted driftwood branch with natural curves".
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-1">Fish</h3>
                    <p className="text-muted-foreground">
                      For fish, specify the species, coloration, and distinctive features.
                      Examples: "Neon tetra with bright blue and red stripe" or
                      "Fancy guppy with flowing orange tail".
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="preview">
          {generatedImageUrl && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Generated Asset</CardTitle>
                  <CardDescription>
                    {form.getValues("name")} ({form.getValues("category")})
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center p-0">
                  <div className="bg-gray-100 bg-opacity-50 rounded-md p-8 flex items-center justify-center">
                    <img 
                      src={generatedImageUrl} 
                      alt={form.getValues("name")}
                      className="max-h-[400px] max-w-full object-contain"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-6">
                  <Button variant="outline" onClick={() => setActiveTab("form")}>
                    Back to Form
                  </Button>
                  <Button>
                    <Check className="mr-2 h-4 w-4" />
                    Save to Library
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Asset Information</CardTitle>
                  <CardDescription>Details about this asset</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sm mb-1">Name</h3>
                    <p className="text-base">{form.getValues("name")}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm mb-1">Category</h3>
                    <p className="text-base capitalize">{form.getValues("category")}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm mb-1">Description</h3>
                    <p className="text-base">{form.getValues("description")}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm mb-1">Style</h3>
                    <p className="text-base capitalize">{form.getValues("style")}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}