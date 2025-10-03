import React, { useEffect, useMemo, useState } from "react";
import { sortDataBy } from '../helpers/tableHelper'
import ExerciseRouter from "../helpers/ExerciseRouter";
import {
    Collapse,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Toolbar,
    Tooltip,
    Typography,
    TableSortLabel,
} from "@mui/material";
import {
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    Refresh as RefreshIcon,
    Search as SearchIcon,
    AddCircle as AddCircleIcon,
    VisibilityOff as VisibilityOffIcon
} from "@mui/icons-material";
import ConfirmationModal from "./modals/ConfirmationModal";

const TABLE_COLORS = {
    "name": "#8E7756",
    "head": "#B39283",
    "data_active": "#D9C8B4",
    "data_inactive": "#FFCC99"
}

export default function ExerciseListCrud() {
    const [rows, setRows] = useState([]);
    const [expanded, setExpanded] = useState(() => new Set()); // exercise ids
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [query, setQuery] = useState("");

    const [order, setOrder] = React.useState("asc");
    const [orderBy, setOrderBy] = React.useState("name");
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isChangeStatusModalOpen, setIsChangeStatusModalOpen] = useState(false)

    const [exerciseToDelete, setExerciseToDelete] = useState("")
    const [exerciseToChangeStatus, setExerciseToChangeStatus] = useState("")

    const SERVER_PORT = window.DJANGO_ENV.SERVER_PORT;
    const serverBase = `${document.location.protocol}//${document.location.hostname}:${SERVER_PORT}`;

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError("");
            try {
                const result = await ExerciseRouter.getExerciseList(serverBase)
                if (result.success == 1){
                    const exercises = result.data.map( exercise => {
                        return {
                            id: exercise.id,
                            name: exercise.name,
                            description: exercise.description,
                            status: exercise.status,
                            category: exercise.guide_page_category.name,
                            universes: exercise.universes
                        }
                    })
                    setRows(exercises);
                }
                else
                    setError("Error to load exercises list, check internet or contact suport");
                
            } catch (error) {
                //console.error(error);
                setError(error.message || "Error to load exercises list, check connection or contact suport");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const normalize = (s) =>
        (s || "")
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "") // tira acentos
          .toLowerCase();

    const filteredRows = useMemo(() => {
        const q = normalize(query)
        if (!q) return rows
        return rows.filter((exercise) => normalize(exercise.name).startsWith(q))
    }, [rows, query]);

    const sortedRows = useMemo(
        () => sortDataBy(filteredRows, orderBy, order),
        [filteredRows, order, orderBy]
    );

    const handleRequestSort = (property) => {
        setOrder((prev) => (orderBy === property && prev === "asc" ? "desc" : "asc"));
        setOrderBy(property);
    };
      

    const handleToggle = (exerciseId) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(exerciseId)) next.delete(exerciseId);
            else next.add(exerciseId);
            return next;
        });
    };

    const handleExerciseDelete = async (e) => {
        try{
            const id = exerciseToDelete.id
            const result = await ExerciseRouter.delete(id, serverBase)
            
            if (result.success == 1){
              setError(`✅ Exercise deleted!`);
              const newRows = rows.filter( exercise => { return exercise.id != id})
              setRows(newRows)
              setExerciseToDelete("")
            }
            else 
              setError(`❌ ${result.error}`);
    
          } catch (error) {
            //console.log("ERRO: "+error)
            setError(`❌ Fail to Delete exercise. Verify connection or contact suport`);
          }finally{
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
    }

    const handleExerciseChangeStatus = async (e) => {
        try{
            const id = exerciseToChangeStatus.id
            const result = await ExerciseRouter.changeStatus(id, serverBase)
            
            if (result.success == 1){
              setError(`✅ Exercise status changed!`);
              const exerciseIndex = rows.findIndex((ex) => {return ex.id == id})
              rows[exerciseIndex].status = result.newStatus
              setRows(rows)
              setExerciseToChangeStatus("")
            }
            else 
              setError(`❌ ${result.error}`);
    
          } catch (error) {
            //console.log("ERRO: "+error)
            setError(`❌ Error on change exercise. Verify connection or contact suport`);
          }finally{
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
    }
    

    return (
        <div style={{ paddingTop: 30, maxWidth: 1200, margin: "0 auto" }}>

            {error && (
                <Paper elevation={0} sx={{ p: 2, mb: 2, border: "1px solid #f44336" }}>
                    <Typography color="error">{error}</Typography>
                </Paper>
            )}
            
            {/* TABLE'S TOOLBAR */}
            <Toolbar sx={{
                display: "flex",
                bgcolor: TABLE_COLORS.name,
                gap: 3
            }}>
                <Typography variant="h5" sx={{ flex: '1 1 100%', }}>EXERCISES</Typography>
                <TextField
                    size="small"
                    placeholder="Filter by name"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    sx={{ bgcolor: "white" }}
                    InputProps={{ endAdornment: <SearchIcon fontSize="small" color="white" /> }}
                />
                <Tooltip title="Add new exercise">
                    <IconButton
                        size="large"
                        sx={{ p: 0,}}
                        onClick={() => { window.location.href = `${serverBase}/createExercise/`}}
                    >
                        <AddCircleIcon sx={{ color: "#3ec922", fontSize: 40 }} />
                    </IconButton>
                </Tooltip>
            </Toolbar>
            
            {/* TABLE */}
            <TableContainer component={Paper} elevation={1} sx={{mb:5}}>
                <Table size="small">

                    {/* TABLE HEAD*/}
                    <TableHead sx={{ bgcolor: TABLE_COLORS.head }}>
                        <TableRow>
                            <TableCell width={56}></TableCell>

                            <TableCell 
                                align="center" 
                                sx={{ fontWeight: "bold" }}
                                sortDirection={orderBy === "name" ? order : false}
                            >
                                <TableSortLabel
                                    active={orderBy === "name"}
                                    direction={orderBy === "name" ? order : "asc"}
                                    onClick={() => handleRequestSort("name")}
                                >
                                    NAME
                                </TableSortLabel>
                            </TableCell>

                            <TableCell align="center" sx={{ fontWeight: "bold" }}>DESCRIPTION</TableCell>

                            <TableCell 
                                align="center" 
                                sx={{ fontWeight: "bold" }}
                                sortDirection={orderBy === "status" ? order : false}
                            >
                                <TableSortLabel
                                    active={orderBy === "status"}
                                    direction={orderBy === "status" ? order : "asc"}
                                    onClick={() => handleRequestSort("status")}
                                >
                                    STATUS
                                </TableSortLabel>
                            </TableCell>

                            <TableCell 
                                align="center" 
                                sx={{ fontWeight: "bold" }}
                                sortDirection={orderBy === "category" ? order : false}
                            >
                                <TableSortLabel
                                    active={orderBy === "category"}
                                    direction={orderBy === "category" ? order : "asc"}
                                    onClick={() => handleRequestSort("category")}
                                >
                                    CATEGORY
                                </TableSortLabel>
                            </TableCell>

                            <TableCell align="center" sx={{ fontWeight: "bold" }} width={50}>ACTIONS</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>

                        {/* TABLE DATA */}
                        {sortedRows.map((ex) => {
                            const isColapseOpen = expanded.has(ex.id);
                            return (
                                <React.Fragment key={ex.id}>
                                    <TableRow 
                                        sx={{ bgcolor: ex.status == "ACTIVE" ? TABLE_COLORS.data_active : TABLE_COLORS.data_inactive }}
                                        hover
                                    >
                                        <TableCell>
                                            <Tooltip title="Show universes">
                                                <IconButton
                                                    size="small"
                                                    sx={{bgcolor:"white"}}
                                                    onClick={() => handleToggle(ex.id)}
                                                >
                                                    {isColapseOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell align="left">{ex.name}</TableCell>
                                        <TableCell align="center">{ex.description}</TableCell>
                                        <TableCell align="left">{ex.status}</TableCell>
                                        <TableCell align="left">{ex.category}</TableCell>
                                        <TableCell align="right">
                                            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                                                <Tooltip title="Edit">
                                                    <IconButton
                                                        color="primary"
                                                        size="small"
                                                        sx={{ p: 0 }}
                                                        onClick={() => { window.location.href = `${serverBase}/updateExercise/${ex.id}/`}}
                                                    >
                                                        <EditIcon sx={{ fontSize: 30 }} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={ex.status == "ACTIVE" ? "Inactivate" : "Activate"}>
                                                    <IconButton
                                                        color="warning"
                                                        size="small"
                                                        sx={{ p: 0 }}
                                                        onClick={() => { 
                                                            setExerciseToChangeStatus(ex)
                                                            setIsChangeStatusModalOpen(true)
                                                        }}
                                                    >
                                                        {
                                                            ex.status == "ACTIVE" ? 
                                                                (<VisibilityOffIcon sx={{ fontSize: 30 }}/>) :
                                                                (<VisibilityIcon sx={{ fontSize: 30 }}/>)
                                                        }
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton
                                                        color="error"
                                                        size="small"
                                                        sx={{ p: 0 }}
                                                        onClick={() => { 
                                                            setExerciseToDelete(ex)
                                                            setIsDeleteModalOpen(true)
                                                        }}
                                                    >
                                                        <DeleteIcon sx={{ fontSize: 30 }} />
                                                    </IconButton>
                                                </Tooltip>
                                            </div>
                                        </TableCell>
                                    </TableRow>

                                    {/* UNIVERSE TABLE */}
                                    <TableRow sx={{ bgcolor: "#A9A9A9"}}>
                                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6} sx={{ p: 0 }}>
                                            <Collapse in={isColapseOpen} timeout="auto" unmountOnExit>
                                                <UniverseTable exercise={ex}/>
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>
                                </React.Fragment>
                            );
                        })}

                        {filteredRows.length === 0 && (
                            <TableRow sx={{bgcolor: TABLE_COLORS.data}}>
                                <TableCell colSpan={6} align="center">
                                    <Typography variant="body1">
                                        { loading ? "Loading...." : "No exercise was found."}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <ConfirmationModal
                modalTitle={`Delete exercise (${exerciseToDelete.name})`}
                buttonTitle="DELETE"
                open={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => handleExerciseDelete()}
            />
            <ConfirmationModal
                modalTitle={`Change status of exercise (${exerciseToChangeStatus.name})`}
                buttonTitle="UPDATE"
                open={isChangeStatusModalOpen}
                onClose={() => setIsChangeStatusModalOpen(false)}
                onConfirm={() => handleExerciseChangeStatus()}
            />
        </div>
    );
}

const UniverseTable = ({exercise}) => {
    return (
        <div style={{ display: "grid", placeItems: "center" }}>
            {exercise.universes?.length ? (
                <TableContainer 
                    sx={{ margin: 2, display: "inline-block", width: "auto", maxWidth: 900 }}>
                    <Typography 
                        variant="h6" 
                        align="center" 
                        sx={{ bgcolor: TABLE_COLORS.name }}
                    >
                        Universes
                    </Typography>

                    <Table size="small" sx={{ width: "auto", bgcolor: TABLE_COLORS.head }}>
                        <TableHead sx={{ bgcolor: "#BD9E7A" }}>
                            <TableRow>
                                <TableCell align="center" sx={{ fontWeight: "bold" }}>Name</TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold" }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {exercise.universes.map((u) => (
                                <TableRow sx={{bgcolor: TABLE_COLORS.data_active}} key={u.id} hover>
                                    <TableCell align="center">{u.name}</TableCell>
                                    <TableCell align="right">
                                        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                                            <Tooltip title="Edit universe">
                                                <IconButton
                                                    color="primary"
                                                    size="small"
                                                    sx={{ p: 0 }}
                                                    onClick={() => { window.location.href = 'createExercise/' }}
                                                >
                                                    <EditIcon sx={{ fontSize: 25 }} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Remove universe from this exercise">
                                                <IconButton
                                                    color="error"
                                                    size="small"
                                                    sx={{ p: 0 }}
                                                    onClick={() => { window.location.href = 'createExercise/' }}
                                                >
                                                    <DeleteIcon sx={{ fontSize: 25 }} />
                                                </IconButton>
                                            </Tooltip>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography variant="body1" sx={{ p: 2 }}>
                    This exercise doesn't use any universe.
                </Typography>
            )}
        </div>
    )
}