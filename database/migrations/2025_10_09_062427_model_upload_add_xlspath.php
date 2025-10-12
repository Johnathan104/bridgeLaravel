<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('model_uploads', function (Blueprint $table) {
            // Add new column to store the link to CSV/Excel file
            $table->string('excel_url')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('model_uploads', function (Blueprint $table) {
            // Drop the column when rolling back
            $table->dropColumn('excel_url');
        });
    }
};
