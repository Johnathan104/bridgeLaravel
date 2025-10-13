<?php

namespace App\Http\Controllers;

use App\Models\Evaluation;
use App\Models\Course; // Assuming Course model exists
use Illuminate\Http\Request;
use Inertia\Inertia;

class EvaluationController extends Controller
{
    /**
     * Display a listing of the resource (Index).
     */
    public function index()
    {
        $evaluations = Evaluation::with('course')->latest()->paginate(10);

        return Inertia::render('Evaluations/Index', [
            'evaluations' => $evaluations,
        ]);
    }

    /**
     * Show the form for creating a new resource (Create).
     */
    public function create()
    {
        // Example: passing available courses to a dropdown
        $courses = Course::all(['id', 'name']);

        return Inertia::render('Evaluations/Create', [
            'courses' => $courses,
        ]);
    }

    /**
     * Store a newly created resource in storage (Store).
     * This method uses redirect()->back().
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'change_id' => 'required|exists:courses,id',
            'ratings' => 'required|integer|min:1|max:5',
            'comments' => 'nullable|string',
            'evaluated_by' => 'required|string|max:255',
            'evaluation_date' => 'required|date',
            'variansi_rencana' => 'required|string',
        ]);

        Evaluation::create($validated);

        // Redirect back to the previous page (e.g., the create form or index page)
        return redirect()->back()
            ->with('success', 'Evaluation successfully created!');
    }

    /**
     * Display the specified resource (Show).
     */
    public function show(Evaluation $evaluation)
    {
        $evaluation->load('course');

        return Inertia::render('Evaluations/Show', [
            'evaluation' => $evaluation,
        ]);
    }

    /**
     * Show the form for editing the specified resource (Edit).
     */
    public function edit(Evaluation $evaluation)
    {
        $courses = Course::all(['id', 'name']);

        return Inertia::render('Evaluations/Edit', [
            'evaluation' => $evaluation,
            'courses' => $courses,
        ]);
    }

    /**
     * Update the specified resource in storage (Update).
     * This method uses redirect()->back().
     */
    public function update(Request $request, Evaluation $evaluation)
    {
        $validated = $request->validate([
            'change_id' => 'required|exists:courses,id',
            'ratings' => 'required|integer|min:1|max:5',
            'comments' => 'nullable|string',
            'evaluated_by' => 'required|string|max:255',
            'evaluation_date' => 'required|date',
            'variansi_rencana' => 'required|string',
        ]);

        $evaluation->update($validated);

        // Redirect back to the previous page (e.g., the index or edit form)
        return redirect()->back()
            ->with('success', 'Evaluation successfully updated!');
    }

    /**
     * Remove the specified resource from storage (Destroy).
     * This method uses redirect()->back().
     */
    public function destroy(Evaluation $evaluation)
    {
        $evaluation->delete();

        // Redirect back to the previous page (e.g., the index page)
        return redirect()->back()
            ->with('success', 'Evaluation successfully deleted!');
    }
}
