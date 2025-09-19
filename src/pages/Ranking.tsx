import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, TrendingUp, Calendar, Heart, MessageCircle, MapPin, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data para ranking semanal
const weeklyRanking = [
  {
    id: "1",
    title: "Acúmulo de lixo na praça central",
    description: "A praça principal está com muito lixo acumulado há dias...",
    category: "lixo",
    likes: 234,
    comments: 45,
    user: {
      name: "Maria Oliveira",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      neighborhood: "Centro"
    },
    location: "Praça Central",
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop"
  },
  {
    id: "2", 
    title: "Semáforo quebrado causa acidentes",
    description: "Semáforo não funciona há uma semana causando muito risco...",
    category: "transporte",
    likes: 189,
    comments: 32,
    user: {
      name: "João Santos",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      neighborhood: "Vila Nova"
    },
    location: "Av. Principal",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop"
  },
  {
    id: "3",
    title: "Buraco gigante na rua principal",
    description: "Há mais de um mês este buraco causa problemas...",
    category: "buraco",
    likes: 167,
    comments: 28,
    user: {
      name: "Ana Silva",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612e6b2?w=100&h=100&fit=crop&crop=face",
      neighborhood: "Centro"
    },
    location: "Rua das Flores, 123",
    image: "https://images.unsplash.com/photo-1578662996442-48f5f70e38de?w=400&h=300&fit=crop"
  }
];

// Ranking de usuários mais ativos
const userRanking = [
  {
    name: "Maria Oliveira",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    neighborhood: "Centro",
    totalLikes: 456,
    totalPosts: 23,
    level: "Super Cidadã"
  },
  {
    name: "João Santos", 
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    neighborhood: "Vila Nova",
    totalLikes: 342,
    totalPosts: 18,
    level: "Cidadão Ativo"
  },
  {
    name: "Ana Silva",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612e6b2?w=100&h=100&fit=crop&crop=face",
    neighborhood: "Jardim das Rosas",
    totalLikes: 289,
    totalPosts: 15,
    level: "Cidadão Engajado"
  }
];

const categoryColors = {
  buraco: "bg-category-buraco",
  iluminacao: "bg-category-iluminacao", 
  lixo: "bg-category-lixo",
  saude: "bg-category-saude",
  seguranca: "bg-category-seguranca",
  transporte: "bg-category-transporte",
};

const Ranking = () => {
  const [activeTab, setActiveTab] = useState("problemas");

  const getRankIcon = (position: number) => {
    if (position === 0) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (position === 1) return <Trophy className="w-5 h-5 text-gray-400" />;
    if (position === 2) return <Trophy className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{position + 1}</span>;
  };

  return (
    <div className="p-4 pb-4">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center space-x-2 mb-2">
          <Trophy className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Ranking Semanal</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Os problemas e cidadãos que mais mobilizaram a comunidade
        </p>
      </div>

      {/* Período */}
      <Card className="mb-6 shadow-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">14 - 21 de Setembro</span>
            </div>
            <Badge variant="secondary">
              <TrendingUp className="w-3 h-3 mr-1" />
              Esta semana
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="problemas">Top Problemas</TabsTrigger>
          <TabsTrigger value="usuarios">Top Cidadãos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="problemas" className="space-y-4">
          {weeklyRanking.map((item, index) => (
            <Card key={item.id} className={cn(
              "shadow-card overflow-hidden",
              index === 0 && "ring-2 ring-primary/20 bg-primary/5"
            )}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  {/* Posição */}
                  <div className="flex flex-col items-center">
                    {getRankIcon(index)}
                    <span className="text-xs text-muted-foreground mt-1">#{index + 1}</span>
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge 
                        variant="secondary" 
                        className={cn("text-white text-xs", categoryColors[item.category as keyof typeof categoryColors])}
                      >
                        {item.category}
                      </Badge>
                    </div>
                    
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{item.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Heart className="w-3 h-3 text-red-500" />
                          <span className="text-xs font-medium">{item.likes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-3 h-3 text-blue-500" />
                          <span className="text-xs font-medium">{item.comments}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={item.user.avatar} />
                          <AvatarFallback className="text-xs">{item.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-xs text-muted-foreground">
                          <p className="font-medium">{item.user.name}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="usuarios" className="space-y-4">
          {userRanking.map((user, index) => (
            <Card key={user.name} className={cn(
              "shadow-card",
              index === 0 && "ring-2 ring-primary/20 bg-primary/5"
            )}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  {/* Posição */}
                  <div className="flex flex-col items-center">
                    {getRankIcon(index)}
                    <span className="text-xs text-muted-foreground mt-1">#{index + 1}</span>
                  </div>

                  {/* Avatar */}
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{user.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {user.neighborhood}
                    </p>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {user.level}
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <div className="text-sm font-bold text-primary">{user.totalLikes}</div>
                    <div className="text-xs text-muted-foreground">curtidas</div>
                    <div className="text-xs text-muted-foreground">{user.totalPosts} posts</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Call to Action */}
      <Card className="mt-6 bg-gradient-secondary shadow-card">
        <CardContent className="p-6 text-center">
          <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Quer aparecer no ranking?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Publique reclamações que ajudem sua comunidade e ganhe curtidas!
          </p>
          <Button asChild className="bg-gradient-primary">
            <Link to="/app/criar">Criar Reclamação</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Ranking;