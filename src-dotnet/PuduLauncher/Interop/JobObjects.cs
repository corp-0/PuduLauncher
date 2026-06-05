using System.Runtime.InteropServices;
using System.Runtime.Versioning;

namespace PuduLauncher.Interop;

/// <summary>
/// Minimal Win32 Job Object interop. Used to bind the TTS process tree's
/// lifetime to the sidecar: a job created with KILL_ON_JOB_CLOSE terminates all
/// its processes when the last handle (held by the sidecar) is closed, including
/// when the sidecar is force-killed.
/// </summary>
[SupportedOSPlatform("windows")]
internal static partial class JobObjects
{
    private const int JobObjectExtendedLimitInformation = 9;
    private const uint JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE = 0x2000;

    [LibraryImport("kernel32.dll", SetLastError = true)]
    private static partial IntPtr CreateJobObjectW(IntPtr lpJobAttributes, IntPtr lpName);

    [LibraryImport("kernel32.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static partial bool SetInformationJobObject(
        IntPtr hJob, int jobObjectInformationClass, IntPtr lpJobObjectInformation, uint cbJobObjectInformationLength);

    [LibraryImport("kernel32.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static partial bool AssignProcessToJobObject(IntPtr hJob, IntPtr hProcess);

    [LibraryImport("kernel32.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static partial bool CloseHandle(IntPtr hObject);

    /// <summary>
    /// Creates a job configured to kill all member processes when its last handle
    /// closes. Returns IntPtr.Zero on failure.
    /// </summary>
    internal static unsafe IntPtr CreateKillOnCloseJob()
    {
        IntPtr handle = CreateJobObjectW(IntPtr.Zero, IntPtr.Zero);
        if (handle == IntPtr.Zero)
        {
            return IntPtr.Zero;
        }

        JOBOBJECT_EXTENDED_LIMIT_INFORMATION info = default;
        info.BasicLimitInformation.LimitFlags = JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE;

        bool ok = SetInformationJobObject(
            handle,
            JobObjectExtendedLimitInformation,
            (IntPtr)(&info),
            (uint)sizeof(JOBOBJECT_EXTENDED_LIMIT_INFORMATION));

        if (!ok)
        {
            CloseHandle(handle);
            return IntPtr.Zero;
        }

        return handle;
    }

    /// <summary>Assigns a process to the job. Returns false on failure.</summary>
    internal static bool TryAssignProcess(IntPtr jobHandle, IntPtr processHandle)
        => AssignProcessToJobObject(jobHandle, processHandle);

    /// <summary>Closes a job handle. Closing the last handle kills member processes.</summary>
    internal static void Close(IntPtr jobHandle)
    {
        if (jobHandle != IntPtr.Zero)
        {
            CloseHandle(jobHandle);
        }
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct JOBOBJECT_BASIC_LIMIT_INFORMATION
    {
        public long PerProcessUserTimeLimit;
        public long PerJobUserTimeLimit;
        public uint LimitFlags;
        public UIntPtr MinimumWorkingSetSize;
        public UIntPtr MaximumWorkingSetSize;
        public uint ActiveProcessLimit;
        public UIntPtr Affinity;
        public uint PriorityClass;
        public uint SchedulingClass;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct IO_COUNTERS
    {
        public ulong ReadOperationCount;
        public ulong WriteOperationCount;
        public ulong OtherOperationCount;
        public ulong ReadTransferCount;
        public ulong WriteTransferCount;
        public ulong OtherTransferCount;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct JOBOBJECT_EXTENDED_LIMIT_INFORMATION
    {
        public JOBOBJECT_BASIC_LIMIT_INFORMATION BasicLimitInformation;
        public IO_COUNTERS IoInfo;
        public UIntPtr ProcessMemoryLimit;
        public UIntPtr JobMemoryLimit;
        public UIntPtr PeakProcessMemoryUsed;
        public UIntPtr PeakJobMemoryUsed;
    }
}
