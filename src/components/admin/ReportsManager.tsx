import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

type Report = {
  id: string;
  type: "bug" | "abuse" | "suggestion" | "other";
  status: "pending" | "investigating" | "resolved" | "closed";
  title: string;
  description: string;
  reportedBy: string;
  createdAt: string;
};

const mockReports: Report[] = [
  {
    id: "1",
    type: "bug",
    status: "pending",
    title: "Erro no agendamento",
    description: "Não consigo finalizar o agendamento após selecionar o horário",
    reportedBy: "cliente@email.com",
    createdAt: "2024-02-14T15:30:00",
  },
  {
    id: "2",
    type: "abuse",
    status: "investigating",
    title: "Profissional inadequado",
    description: "Comportamento inadequado durante o atendimento",
    reportedBy: "outro@email.com",
    createdAt: "2024-02-13T10:15:00",
  },
  {
    id: "3",
    type: "suggestion",
    status: "resolved",
    title: "Sugestão de melhoria",
    description: "Adicionar opção de pagamento com PIX",
    reportedBy: "usuario@email.com",
    createdAt: "2024-02-12T09:45:00",
  },
];

export function ReportsManager() {
  const [reports] = useState<Report[]>(mockReports);
  const [filter, setFilter] = useState({
    type: "all",
    status: "all",
    search: "",
  });

  const getStatusColor = (status: Report["status"]) => {
    const colors = {
      pending: "bg-yellow-500",
      investigating: "bg-blue-500",
      resolved: "bg-green-500",
      closed: "bg-gray-500",
    };
    return colors[status];
  };

  const getTypeColor = (type: Report["type"]) => {
    const colors = {
      bug: "bg-red-500",
      abuse: "bg-purple-500",
      suggestion: "bg-blue-500",
      other: "bg-gray-500",
    };
    return colors[type];
  };

  const filteredReports = reports.filter((report) => {
    const matchesType = filter.type === "all" || report.type === filter.type;
    const matchesStatus =
      filter.status === "all" || report.status === filter.status;
    const matchesSearch =
      filter.search === "" ||
      report.title.toLowerCase().includes(filter.search.toLowerCase()) ||
      report.description.toLowerCase().includes(filter.search.toLowerCase());

    return matchesType && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">Gerenciador de Denúncias</h2>
        <p className="text-sm text-primary/70">
          Gerencie denúncias, sugestões e problemas reportados
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Select
                onValueChange={(value) =>
                  setFilter((prev) => ({ ...prev, type: value }))
                }
                defaultValue="all"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="bug">Bugs</SelectItem>
                  <SelectItem value="abuse">Denúncias</SelectItem>
                  <SelectItem value="suggestion">Sugestões</SelectItem>
                  <SelectItem value="other">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Select
                onValueChange={(value) =>
                  setFilter((prev) => ({ ...prev, status: value }))
                }
                defaultValue="all"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="investigating">Em investigação</SelectItem>
                  <SelectItem value="resolved">Resolvido</SelectItem>
                  <SelectItem value="closed">Fechado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Input
                placeholder="Pesquisar..."
                value={filter.search}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, search: e.target.value }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Reportado por</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <Badge
                      className={`${getTypeColor(report.type)} text-white`}
                    >
                      {report.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${getStatusColor(report.status)} text-white`}
                    >
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{report.title}</TableCell>
                  <TableCell>{report.reportedBy}</TableCell>
                  <TableCell>
                    {new Date(report.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Ver Detalhes
                      </Button>
                      <Button variant="outline" size="sm">
                        Atualizar Status
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
