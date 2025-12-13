using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace PuduLauncher.Models.ConfigFile;

public class Preferences : INotifyPropertyChanged
{
    private bool _autoRemove = true;
    private int _ignoreVersionUpdate;
    private string _installationPath = string.Empty;
    private bool? _ttsEnabled;

    public event PropertyChangedEventHandler? PropertyChanged;

    public bool AutoRemove
    {
        get => _autoRemove;
        set => SetField(ref _autoRemove, value);
    }

    public int IgnoreVersionUpdate
    {
        get => _ignoreVersionUpdate;
        set => SetField(ref _ignoreVersionUpdate, value);
    }

    public string InstallationPath
    {
        get => _installationPath;
        set => SetField(ref _installationPath, value);
    }

    public bool? TTSEnabled
    {
        get => _ttsEnabled;
        set => SetField(ref _ttsEnabled, value);
    }

    private void SetField<T>(ref T field, T value, [CallerMemberName] string? propertyName = null)
    {
        if (EqualityComparer<T>.Default.Equals(field, value))
        {
            return;
        }

        field = value;
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
    }
}
